import { memo, ReactNode } from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowClickPrevious?: boolean;
  variant?: 'default' | 'compact' | 'vertical';
  className?: string;
}

// ============================================================================
// ProgressSteps Component
// ============================================================================

/**
 * ProgressSteps - Visual progress indicator for multi-step forms
 * 
 * Features:
 * - Multiple variants (default, compact, vertical)
 * - Clickable steps (optional)
 * - Animated transitions
 * - Accessible
 */
export const ProgressSteps = memo(({
  steps,
  currentStep,
  onStepClick,
  allowClickPrevious = true,
  variant = 'default',
  className = '',
}: ProgressStepsProps) => {
  const handleStepClick = (index: number) => {
    if (!onStepClick) return;
    if (allowClickPrevious && index < currentStep) {
      onStepClick(index);
    }
  };

  if (variant === 'vertical') {
    return (
      <VerticalSteps
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        allowClickPrevious={allowClickPrevious}
        className={className}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <CompactSteps
        steps={steps}
        currentStep={currentStep}
        className={className}
      />
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress line */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = allowClickPrevious && index < currentStep && onStepClick;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                {/* Step circle */}
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-background border-primary text-primary ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-background border-border text-muted-foreground',
                    isClickable && 'cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-primary/20',
                    !isClickable && 'cursor-default'
                  )}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 animate-in zoom-in duration-200" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>

                {/* Step title */}
                <div className="mt-2 text-center">
                  <p className={cn(
                    'text-xs font-medium transition-colors duration-200',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[80px] hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ProgressSteps.displayName = 'ProgressSteps';

// ============================================================================
// Compact Steps (just dots)
// ============================================================================

interface CompactStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const CompactSteps = memo(({ steps, currentStep, className }: CompactStepsProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isCurrent && 'w-6 bg-primary',
              isCompleted && 'w-2 bg-primary',
              !isCompleted && !isCurrent && 'w-2 bg-border'
            )}
            title={step.title}
          />
        );
      })}
      <span className="ml-2 text-xs text-muted-foreground">
        {currentStep + 1} of {steps.length}
      </span>
    </div>
  );
});

CompactSteps.displayName = 'CompactSteps';

// ============================================================================
// Vertical Steps
// ============================================================================

interface VerticalStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  allowClickPrevious?: boolean;
  className?: string;
}

const VerticalSteps = memo(({ 
  steps, 
  currentStep, 
  onStepClick,
  allowClickPrevious,
  className 
}: VerticalStepsProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;
        const isClickable = allowClickPrevious && index < currentStep && onStepClick;

        return (
          <div key={step.id} className="flex gap-4">
            {/* Left column: circle and line */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shrink-0',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-background border-primary text-primary ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-background border-border text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-110'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              
              {/* Connecting line */}
              {!isLast && (
                <div className={cn(
                  'w-0.5 flex-1 min-h-[40px] transition-colors duration-300',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>

            {/* Right column: content */}
            <div className={cn(
              'pb-8 transition-opacity duration-200',
              !isCompleted && !isCurrent && 'opacity-50'
            )}>
              <h4 className={cn(
                'font-medium text-sm mb-1',
                isCurrent && 'text-primary'
              )}>
                {step.title}
              </h4>
              {step.description && (
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

VerticalSteps.displayName = 'VerticalSteps';

// ============================================================================
// Progress Bar (Simple)
// ============================================================================

interface SimpleProgressProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export const SimpleProgress = memo(({ 
  current, 
  total, 
  showLabel = true,
  className 
}: SimpleProgressProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Step {current} of {total}</span>
          <span>{percentage}% complete</span>
        </div>
      )}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

SimpleProgress.displayName = 'SimpleProgress';

export default ProgressSteps;
