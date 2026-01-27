import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface OnboardingWelcomeProps {
  userName?: string;
  onStart: () => void;
  onSkip: () => void;
}

export const OnboardingWelcome = ({ userName, onStart, onSkip }: OnboardingWelcomeProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg border-primary/50 bg-card/95 backdrop-blur-xl relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
        </div>

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/20 cosmic-glow animate-bounce">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to AstroLord
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {userName ? `Hi ${userName}!` : 'Hello!'} Ready to discover your cosmic blueprint?
          </p>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Create Your Birth Chart</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your birth details to generate your personalized Vedic astrology chart
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-secondary font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Chat with AI Astrologer</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your chart, career, relationships, and life purpose
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-accent font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Explore Advanced Features</h3>
                <p className="text-sm text-muted-foreground">
                  Discover transits, relationship matching, and daily cosmic insights
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onSkip}
              className="border-border/50"
            >
              Skip for now
            </Button>
            <Button
              onClick={onStart}
              className="cosmic-glow"
            >
              <span>Let's Start</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Takes ~2 minutes • No credit card required
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
