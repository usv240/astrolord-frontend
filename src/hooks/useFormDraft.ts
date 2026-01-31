import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const log = createLogger('useFormDraft');

interface UseFormDraftOptions<T> {
  key: string;
  initialData: T;
  debounceMs?: number;
  showToasts?: boolean;
  expirationMs?: number; // How long to keep draft (default 24 hours)
}

interface DraftData<T> {
  data: T;
  savedAt: string;
  expiresAt: string;
}

/**
 * useFormDraft - Auto-saves form data to localStorage
 * 
 * Features:
 * - Debounced auto-save on every change
 * - Restore prompt when draft exists
 * - Expiration support
 * - Clear draft on successful submit
 */
export function useFormDraft<T extends object>({
  key,
  initialData,
  debounceMs = 1000,
  showToasts = true,
  expirationMs = 24 * 60 * 60 * 1000, // 24 hours
}: UseFormDraftOptions<T>) {
  const storageKey = `astrolord_draft_${key}`;
  const [data, setData] = useState<T>(initialData);
  const [hasDraft, setHasDraft] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const draft: DraftData<T> = JSON.parse(stored);
        const now = new Date();
        const expiresAt = new Date(draft.expiresAt);
        
        if (now < expiresAt) {
          setHasDraft(true);
        } else {
          // Draft expired, clear it
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      log.debug('Failed to check draft', { error: String(error) });
      localStorage.removeItem(storageKey);
    }
    initialLoadRef.current = false;
  }, [storageKey]);

  // Debounced save
  useEffect(() => {
    if (initialLoadRef.current) return;
    
    // Check if data has meaningful content (not just empty strings)
    const hasContent = Object.values(data).some(val => 
      typeof val === 'string' ? val.trim() !== '' : val !== undefined && val !== null
    );
    
    if (!hasContent) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const draft: DraftData<T> = {
          data,
          savedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + expirationMs).toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch (error) {
        log.debug('Failed to save draft', { error: String(error) });
      }
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, storageKey, debounceMs, expirationMs]);

  // Restore draft
  const restoreDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const draft: DraftData<T> = JSON.parse(stored);
        setData(draft.data);
        setHasDraft(false);
        setIsRestored(true);
        
        if (showToasts) {
          const savedAt = new Date(draft.savedAt);
          toast.success('Draft restored! 📝', {
            description: `From ${savedAt.toLocaleTimeString()}`,
            duration: 3000,
          });
        }
      }
    } catch (error) {
      log.error('Failed to restore draft', { error: String(error) });
      if (showToasts) {
        toast.error('Failed to restore draft');
      }
    }
  }, [storageKey, showToasts]);

  // Dismiss draft without restoring
  const dismissDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    
    if (showToasts) {
      toast.info('Draft discarded');
    }
  }, [storageKey, showToasts]);

  // Clear draft (call on successful submit)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setIsRestored(false);
  }, [storageKey]);

  // Update data
  const updateData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  }, []);

  // Reset to initial
  const resetData = useCallback(() => {
    setData(initialData);
    clearDraft();
  }, [initialData, clearDraft]);

  return {
    data,
    setData: updateData,
    resetData,
    hasDraft,
    isRestored,
    restoreDraft,
    dismissDraft,
    clearDraft,
  };
}

export default useFormDraft;

