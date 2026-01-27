import { useQuota } from '@/hooks/useQuota';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BarChart3, MessageSquare, AlertTriangle } from 'lucide-react';

interface QuotaCheckResult {
  allowed: boolean;
  showUpgrade: boolean;
}

export const useQuotaCheck = () => {
  const { isQuotaExceeded, getRemainingQuota, incrementUsage } = useQuota();
  const navigate = useNavigate();

  /**
   * Check if action is allowed based on quota
   * Returns { allowed: boolean, showUpgrade: boolean }
   */
  const checkQuota = (type: 'charts' | 'messages' = 'messages'): QuotaCheckResult => {
    const exceeded = isQuotaExceeded(type);
    const remaining = getRemainingQuota(type);

    if (exceeded) {
      return { allowed: false, showUpgrade: true };
    }

    if (remaining <= 5 && remaining > 0) {
      return { allowed: true, showUpgrade: true };
    }

    return { allowed: true, showUpgrade: false };
  };

  return {
    checkQuota,
    incrementUsage,
    getRemainingQuota,
    isQuotaExceeded,
  };
};

interface QuotaExceededDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'charts' | 'messages';
  remaining?: number;
}

export const QuotaExceededDialog = ({
  open,
  onOpenChange,
  type,
  remaining = 0,
}: QuotaExceededDialogProps) => {
  const navigate = useNavigate();

  const isExceeded = remaining === 0;
  const typeLabel = type === 'charts' ? 'charts' : 'messages';
  const Icon = type === 'charts' ? BarChart3 : MessageSquare;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isExceeded ? (
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" /> Quota Exceeded
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Running Low
              </span>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {isExceeded ? (
              <>
                <p>You've used all your {typeLabel} for this period.</p>
                <p className="font-semibold text-foreground">
                  Upgrade to continue using AstroLord!
                </p>
              </>
            ) : (
              <>
                <p>
                  You have {remaining} {typeLabel} remaining.
                </p>
                <p className="font-semibold text-foreground">
                  Consider upgrading for unlimited access!
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {isExceeded ? (
            <>
              <AlertDialogCancel>Maybe Later</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onOpenChange(false);
                  navigate('/pricing');
                }}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Upgrade Now
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel>Continue</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onOpenChange(false);
                  navigate('/pricing');
                }}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                View Plans
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
