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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-primary/50 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        {/* Header with progress */}
        <CardHeader className="sticky top-0 bg-card/95 backdrop-blur z-10 border-b border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Step {step.step} of {steps.length}: {step.title}
              </CardTitle>
              <button
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm underline"
              >
                Skip Tour
              </button>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground">
                {step.estimatedTime}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          {/* Step content */}
          <div className="space-y-4">
            {/* Icon/Visual */}
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-4xl">{step.icon}</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-base text-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Details/Tips */}
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-secondary" />
                What You'll Do:
              </h4>
              <ul className="space-y-2">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary font-semibold mt-0.5">•</span>
                    <span className="text-muted-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro tip for first chart creation */}
            {currentStep === 1 && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-accent mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-muted-foreground">
                  Accurate birth time is important for precise chart calculations. If you don't know your exact time, you can use 12:00 noon or leave it unknown.
                </p>
              </div>
            )}

            {/* Privacy & Security Banner - all steps */}
            <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <span>🔒</span>
                <span>Your Privacy Is Protected</span>
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>All your data is encrypted end-to-end</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Only you can access your charts and messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>We never share your data with third parties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Your birth information and chat history are completely private</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Previous
            </Button>

            {isLastStep ? (
              <Button
                onClick={onComplete}
                className="flex-1 cosmic-glow"
              >
                <Check className="h-4 w-4 mr-2" />
                Start Exploring
              </Button>
            ) : (
              <Button
                onClick={onNext}
                className="flex-1 cosmic-glow"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Step indicators - Clickable */}
          <div className="flex justify-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onGoToStep?.(idx)}
                className={`h-2 rounded-full transition-all duration-200 hover:opacity-80 ${
                  idx === currentStep
                    ? 'bg-primary w-6'
                    : idx < currentStep
                      ? 'bg-primary/50 w-2 hover:bg-primary/70 cursor-pointer'
                      : 'bg-border w-2 hover:bg-muted-foreground/50 cursor-pointer'
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
