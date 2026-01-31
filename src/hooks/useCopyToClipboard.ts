import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const log = createLogger('useCopyToClipboard');

interface UseCopyToClipboardOptions {
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  resetDelay?: number;
}

/**
 * useCopyToClipboard - Hook for copying text to clipboard
 * 
 * Features:
 * - Modern clipboard API with fallback
 * - Toast notifications
 * - Copied state for visual feedback
 * - Auto-reset after delay
 */
export function useCopyToClipboard({
  showToast = true,
  successMessage = 'Copied to clipboard!',
  errorMessage = 'Failed to copy',
  resetDelay = 2000,
}: UseCopyToClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!text) return false;

    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) throw new Error('Copy failed');
      }

      setIsCopied(true);
      setCopiedText(text);

      if (showToast) {
        toast.success(successMessage, { duration: 2000 });
      }

      // Reset after delay
      setTimeout(() => {
        setIsCopied(false);
      }, resetDelay);

      return true;
    } catch (error) {
      log.error('Copy failed', { error: String(error) });
      
      if (showToast) {
        toast.error(errorMessage);
      }

      return false;
    }
  }, [showToast, successMessage, errorMessage, resetDelay]);

  const reset = useCallback(() => {
    setIsCopied(false);
    setCopiedText(null);
  }, []);

  return { copy, isCopied, copiedText, reset };
}

export default useCopyToClipboard;

