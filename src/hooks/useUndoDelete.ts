import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseUndoDeleteOptions<T> {
  onDelete: (item: T) => Promise<void>;
  onUndo: (item: T) => Promise<void>;
  undoTimeoutMs?: number;
  getItemName?: (item: T) => string;
  itemType?: string; // e.g., "chart", "match"
}

interface PendingDelete<T> {
  item: T;
  toastId: string | number;
  timeoutId: NodeJS.Timeout;
}

/**
 * useUndoDelete - Provides undo functionality for delete operations
 * 
 * Features:
 * - Shows toast with undo button
 * - 5-second window to undo
 * - Optimistic UI update
 * - Pending delete queue
 */
export function useUndoDelete<T>({
  onDelete,
  onUndo,
  undoTimeoutMs = 5000,
  getItemName = () => 'Item',
  itemType = 'item',
}: UseUndoDeleteOptions<T>) {
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, PendingDelete<T>>>(new Map());
  const pendingRef = useRef(pendingDeletes);
  pendingRef.current = pendingDeletes;

  const generateId = () => `delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const initiateDelete = useCallback(async (
    item: T,
    itemId: string,
    onOptimisticDelete?: () => void,
    onOptimisticRestore?: () => void
  ) => {
    const deleteId = generateId();
    const itemName = getItemName(item);

    // Perform optimistic UI update
    onOptimisticDelete?.();

    // Show toast with undo button
    const toastId = toast.loading(`Deleting ${itemType}...`, {
      description: itemName,
      action: {
        label: 'Undo',
        onClick: () => {
          undoDelete(deleteId, onOptimisticRestore);
        },
      },
      duration: undoTimeoutMs,
    });

    // Set timeout for actual deletion
    const timeoutId = setTimeout(async () => {
      try {
        await onDelete(item);
        
        // Update toast to success
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted`, {
          id: toastId,
          description: itemName,
          duration: 2000,
        });
      } catch (error) {
        // Restore on error
        onOptimisticRestore?.();
        toast.error(`Failed to delete ${itemType}`, {
          id: toastId,
          description: 'Please try again.',
        });
      } finally {
        // Remove from pending
        setPendingDeletes(prev => {
          const next = new Map(prev);
          next.delete(deleteId);
          return next;
        });
      }
    }, undoTimeoutMs);

    // Track pending delete
    const pending: PendingDelete<T> = {
      item,
      toastId,
      timeoutId,
    };

    setPendingDeletes(prev => {
      const next = new Map(prev);
      next.set(deleteId, pending);
      return next;
    });

    return deleteId;
  }, [onDelete, undoTimeoutMs, getItemName, itemType]);

  const undoDelete = useCallback(async (
    deleteId: string,
    onOptimisticRestore?: () => void
  ) => {
    const pending = pendingRef.current.get(deleteId);
    if (!pending) return;

    // Clear timeout to prevent actual deletion
    clearTimeout(pending.timeoutId);

    // Restore item
    onOptimisticRestore?.();

    try {
      await onUndo(pending.item);
      
      toast.success('Restored!', {
        id: pending.toastId,
        description: `${getItemName(pending.item)} has been restored.`,
        duration: 2000,
      });
    } catch (error) {
      toast.error('Failed to restore', {
        id: pending.toastId,
      });
    }

    // Remove from pending
    setPendingDeletes(prev => {
      const next = new Map(prev);
      next.delete(deleteId);
      return next;
    });
  }, [onUndo, getItemName]);

  const cancelAllPending = useCallback(() => {
    pendingRef.current.forEach((pending, deleteId) => {
      clearTimeout(pending.timeoutId);
      toast.dismiss(pending.toastId);
    });
    setPendingDeletes(new Map());
  }, []);

  return {
    initiateDelete,
    undoDelete,
    cancelAllPending,
    hasPendingDeletes: pendingDeletes.size > 0,
    pendingCount: pendingDeletes.size,
  };
}

export default useUndoDelete;

