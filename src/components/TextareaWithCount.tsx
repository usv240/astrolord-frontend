import { memo, forwardRef, useId } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextareaWithCountProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCount?: boolean;
  warningThreshold?: number; // Percentage at which to show warning (e.g., 0.9 = 90%)
  label?: string;
}

/**
 * TextareaWithCount - Textarea with character count display
 * 
 * Features:
 * - Shows current/max character count
 * - Warning color when near limit
 * - Error color when at limit
 * - Accessible with aria attributes
 */
export const TextareaWithCount = memo(forwardRef<HTMLTextAreaElement, TextareaWithCountProps>(
  ({ 
    maxLength, 
    showCount = true, 
    warningThreshold = 0.9,
    label,
    className,
    value,
    defaultValue,
    onChange,
    ...props 
  }, ref) => {
    const id = useId();
    const currentLength = typeof value === 'string' 
      ? value.length 
      : typeof defaultValue === 'string' 
        ? defaultValue.length 
        : 0;

    const isNearLimit = maxLength && currentLength >= maxLength * warningThreshold;
    const isAtLimit = maxLength && currentLength >= maxLength;
    const remaining = maxLength ? maxLength - currentLength : null;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <Textarea
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            maxLength={maxLength}
            className={cn(
              className,
              isAtLimit && 'border-destructive focus-visible:ring-destructive/50'
            )}
            aria-describedby={showCount && maxLength ? `${id}-count` : undefined}
            {...props}
          />
          
          {showCount && maxLength && (
            <div 
              id={`${id}-count`}
              className={cn(
                'absolute bottom-2 right-2 text-xs transition-colors duration-200',
                isAtLimit 
                  ? 'text-destructive font-medium' 
                  : isNearLimit 
                    ? 'text-yellow-500' 
                    : 'text-muted-foreground'
              )}
              aria-live="polite"
            >
              {currentLength}/{maxLength}
              {remaining !== null && remaining <= 20 && remaining > 0 && (
                <span className="ml-1 text-yellow-500">
                  ({remaining} left)
                </span>
              )}
              {isAtLimit && (
                <span className="ml-1">
                  (limit reached)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
));

TextareaWithCount.displayName = 'TextareaWithCount';

/**
 * Simple character count display component
 */
export const CharacterCount = memo(({
  current,
  max,
  className,
}: {
  current: number;
  max: number;
  className?: string;
}) => {
  const percentage = current / max;
  const isNearLimit = percentage >= 0.9;
  const isAtLimit = percentage >= 1;

  return (
    <span 
      className={cn(
        'text-xs transition-colors duration-200',
        isAtLimit 
          ? 'text-destructive font-medium' 
          : isNearLimit 
            ? 'text-yellow-500' 
            : 'text-muted-foreground',
        className
      )}
    >
      {current}/{max}
    </span>
  );
});

CharacterCount.displayName = 'CharacterCount';

export default TextareaWithCount;

