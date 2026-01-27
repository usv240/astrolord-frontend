import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Sparkles,
  MessageSquare,
  Heart,
  BarChart3,
  Search,
  TrendingUp,
  Lock,
  Lightbulb,
} from 'lucide-react';

interface EmptyStatesProps {
  type: 'no-charts' | 'no-results' | 'no-matches' | 'no-history';
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export const EmptyStates = ({ type, onPrimaryAction, onSecondaryAction }: EmptyStatesProps) => {
  const configs = {
    'no-charts': {
      icon: <BarChart3 className="h-16 w-16" />,
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
    },
    'no-results': {
      icon: <Search className="h-16 w-16" />,
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
    },
    'no-matches': {
      icon: <Heart className="h-16 w-16" />,
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
    },
    'no-history': {
      icon: <MessageSquare className="h-16 w-16" />,
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
    },
  };

  const config = configs[type];

  return (
    <div className="w-full">
      <Card className="border-border/50 backdrop-blur-sm bg-card/80">
        <CardContent className="py-12 text-center">
          <div className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center animate-bounce text-primary/70">{config.icon}</div>

            {/* Main Message */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">{config.title}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">{config.description}</p>
            </div>

            {/* Benefits List */}
            <div className="bg-secondary/5 border border-secondary/30 rounded-lg p-4 max-w-md mx-auto text-left">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                What You Can Do:
              </p>
              <ul className="space-y-2">
                {config.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-secondary mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Details */}
            <p className="text-xs text-muted-foreground italic max-w-md mx-auto flex items-start gap-2 justify-center">
              <Lightbulb className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />{' '}
              <span>{config.details}</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onPrimaryAction} className="cosmic-glow sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {config.primaryText}
              </Button>
              {onSecondaryAction && (
                <Button
                  onClick={onSecondaryAction}
                  variant="outline"
                  className="border-border/50 sm:w-auto"
                >
                  {config.secondaryText}
                </Button>
              )}
            </div>

            {/* Trust Message */}
            <div className="bg-primary/5 border border-primary/30 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Lock className="h-3 w-3 mt-0.5 shrink-0" />{' '}
                <span>
                  <span className="font-semibold">Your data is encrypted & private</span> — All your
                  charts and conversations are secure.
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
