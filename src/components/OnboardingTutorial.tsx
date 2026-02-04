import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  estimatedTime: string;
}

interface OnboardingTutorialProps {
  currentStep: number;
  steps: OnboardingStep[];
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onGoToStep?: (step: number) => void;
}

export const OnboardingTutorial = ({
  currentStep,
  steps,
  onNext,
  onPrevious,
  onComplete,
  onSkip,
  onGoToStep,
}: OnboardingTutorialProps) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  // Keyboard shortcuts for navigation
  const handleNextOrComplete = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  }, [isLastStep, onComplete, onNext]);

  useKeyboardShortcuts({
    shortcuts: [
      { key: 'Escape', handler: onSkip, description: 'Skip tutorial' },
      { key: 'ArrowRight', handler: onNext, description: 'Next step' },
      { key: 'ArrowLeft', handler: onPrevious, description: 'Previous step' },
      { key: 'Enter', handler: handleNextOrComplete, description: 'Continue/Complete' },
    ],
    enabled: true,
  });

  useEffect(() => {
    // Auto-scroll content on step change
    const timer = setTimeout(() => setIsAutoScrolling(true), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <Card className="w-full max-w-lg border-primary/50 bg-card/95 backdrop-blur-xl">
        {/* Header with progress */}
        <CardHeader className="py-3 px-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl font-bold">
                Step {step.step} of {steps.length}: {step.title}
              </CardTitle>
              <button
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground transition-colors text-xs underline"
              >
                Skip Tour
              </button>
            </div>
            <Progress value={progress} className="h-1" />
            <p className="text-[10px] text-muted-foreground">
              {step.estimatedTime}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 py-3 px-4">
          {/* Icon + Description in one row on mobile */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
              <div className="text-2xl">{step.icon}</div>
            </div>
            <p className="text-sm text-foreground leading-snug">
              {step.description}
            </p>
          </div>

          {/* Details/Tips - compact */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 space-y-1.5">
            <h4 className="font-semibold text-xs flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 text-secondary" />
              What You'll Do:
            </h4>
            <ul className="space-y-1">
              {step.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs">
                  <span className="text-secondary font-semibold mt-0.5">•</span>
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy note */}
          <p className="text-[10px] text-muted-foreground text-center">
            🔒 Your data is encrypted and 100% private
          </p>

          {/* Navigation buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 0}
              className="flex-1 h-9 text-sm"
            >
              Previous
            </Button>

            {isLastStep ? (
              <Button
                onClick={onComplete}
                className="flex-1 h-9 text-sm cosmic-glow"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Start
              </Button>
            ) : (
              <Button
                onClick={onNext}
                className="flex-1 h-9 text-sm cosmic-glow"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>

          {/* Step indicators - Clickable */}
          <div className="flex justify-center gap-1.5 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onGoToStep?.(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 hover:opacity-80 ${idx === currentStep
                  ? 'bg-primary w-5'
                  : idx < currentStep
                    ? 'bg-primary/50 w-1.5 hover:bg-primary/70 cursor-pointer'
                    : 'bg-border w-1.5 hover:bg-muted-foreground/50 cursor-pointer'
                  }`}
                aria-label={`Go to step ${idx + 1}`}
                title={`Step ${idx + 1}: ${steps[idx]?.title}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
