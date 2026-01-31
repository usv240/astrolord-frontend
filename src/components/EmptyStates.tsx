import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Sparkles,
  MessageSquare,
  Heart,
  BarChart3,
  Search,
  Lock,
  Lightbulb,
  Star,
  Moon,
  Sun,
} from 'lucide-react';

interface EmptyStatesProps {
  type: 'no-charts' | 'no-results' | 'no-matches' | 'no-history';
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

// Animated illustration component
const CosmicIllustration = ({ type }: { type: string }) => {
  if (type === 'no-charts') {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '20s' }} />
        {/* Middle ring */}
        <div className="absolute inset-4 rounded-full border-2 border-secondary/40 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </div>
        {/* Floating planets */}
        <Star className="absolute top-2 right-2 h-3 w-3 text-accent animate-pulse" />
        <Moon className="absolute bottom-4 left-0 h-4 w-4 text-secondary animate-bounce" style={{ animationDelay: '0.5s' }} />
        <Sun className="absolute top-8 left-2 h-3 w-3 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    );
  }
  
  if (type === 'no-matches') {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Two overlapping hearts */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500/20 to-primary/20 flex items-center justify-center animate-pulse">
          <Heart className="h-7 w-7 text-pink-400" />
        </div>
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-secondary/20 to-purple-500/20 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Heart className="h-7 w-7 text-secondary" />
        </div>
        {/* Connection line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-pink-500/50 to-secondary/50" />
        {/* Sparkles */}
        <Sparkles className="absolute top-4 right-6 h-4 w-4 text-accent animate-bounce" />
        <Star className="absolute bottom-4 left-6 h-3 w-3 text-accent animate-pulse" />
      </div>
    );
  }
  
  if (type === 'no-history') {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
        </div>
        {/* Chat bubbles */}
        <div className="absolute top-2 right-4 w-6 h-4 rounded-full bg-secondary/30 animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-6 right-8 w-4 h-3 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0.4s' }} />
        <Sparkles className="absolute bottom-4 left-4 h-4 w-4 text-accent animate-pulse" />
      </div>
    );
  }
  
  // Default for no-results
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin" style={{ animationDuration: '10s' }} />
    </div>
  );
};

export const EmptyStates = ({ type, onPrimaryAction, onSecondaryAction }: EmptyStatesProps) => {
  const configs = {
    'no-charts': {
      title: 'No Birth Charts Yet',
      description:
        'Your cosmic blueprint is waiting! Create your first birth chart to unlock personalized astrological insights.',
      benefits: [
        "Discover your birth chart's cosmic secrets",
        'Chat with our AI Astrologer about your chart',
        'Track planetary transits affecting you',
        'Get personalized remedies and guidance',
      ],
      primaryText: 'Create Your First Chart',
      secondaryText: 'Learn About Birth Charts',
      details: "Takes about 1 minute. You'll need your birth date, time (if known), and location.",
      gradient: 'from-primary/5 to-secondary/5',
    },
    'no-results': {
      title: 'No Charts Found',
      description: "Your search didn't match any of your charts.",
      benefits: [
        'Try adjusting your search terms',
        'Use different date ranges',
        "Search by person's name",
      ],
      primaryText: 'Clear Filters',
      secondaryText: 'Create a New Chart',
      details: 'Hint: Try searching by birth date or location.',
      gradient: 'from-muted/5 to-muted/10',
    },
    'no-matches': {
      title: 'No Relationship Matches Yet',
      description:
        'Compare your chart with others to discover compatibility and relationship insights.',
      benefits: [
        'Check romantic compatibility',
        'Compare with friends & family',
        'Get detailed relationship insights',
        'Understand your connection better',
      ],
      primaryText: 'Create Your First Match',
      secondaryText: 'Learn About Compatibility',
      details: "You'll need a birth chart and someone else's birth details.",
      gradient: 'from-pink-500/5 to-secondary/5',
    },
    'no-history': {
      title: 'No Chat History',
      description:
        'Start a conversation with our AI Astrologer to get personalized insights about your chart.',
      benefits: [
        'Get instant astrological guidance',
        'Ask about career, love, health & more',
        'All conversations are private & encrypted',
        'Insights based on your birth chart',
      ],
      primaryText: 'Start Chatting',
      secondaryText: 'View Chart Details',
      details: 'Select a chart first to begin your conversation.',
      gradient: 'from-primary/5 to-accent/5',
    },
  };

  const config = configs[type];

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
      <Card className={`border-border/50 backdrop-blur-sm bg-gradient-to-br ${config.gradient} border-dashed`}>
        <CardContent className="py-12 text-center">
          <div className="space-y-6">
            {/* Animated Illustration */}
            <CosmicIllustration type={type} />

            {/* Main Message */}
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {config.title}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">{config.description}</p>
            </div>

            {/* Benefits List */}
            <div className="bg-card/50 border border-border/50 rounded-xl p-4 max-w-md mx-auto text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                What You Can Do:
              </p>
              <ul className="space-y-2">
                {config.benefits.map((benefit, idx) => (
                  <li 
                    key={idx} 
                    className="text-sm text-muted-foreground flex items-start gap-2"
                    style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                  >
                    <span className="text-accent mt-0.5">✦</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Details */}
            <p className="text-xs text-muted-foreground italic max-w-md mx-auto flex items-start gap-2 justify-center animate-in fade-in duration-500 delay-300">
              <Lightbulb className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />{' '}
              <span>{config.details}</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <Button 
                onClick={onPrimaryAction} 
                className="cosmic-glow sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {config.primaryText}
              </Button>
              {onSecondaryAction && (
                <Button
                  onClick={onSecondaryAction}
                  variant="outline"
                  className="border-border/50 sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {config.secondaryText}
                </Button>
              )}
            </div>

            {/* Trust Message */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 max-w-md mx-auto animate-in fade-in duration-500 delay-500">
              <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
                <Lock className="h-3 w-3 shrink-0" />
                <span>
                  <span className="font-semibold">Your data is encrypted & private</span>
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyStates;
