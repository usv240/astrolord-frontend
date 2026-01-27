import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Heart,
  Sparkles,
  TrendingUp,
  Calendar,
  Zap,
  Lightbulb,
  Target,
  Lock,
  Crown,
} from 'lucide-react';

interface FeatureSpotlightProps {
  onNavigate: (tab: string) => void;
  activeTab?: string;
}

export const FeatureSpotlight = ({ onNavigate, activeTab }: FeatureSpotlightProps) => {
  const features = [
    {
      id: 'create',
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Create Chart',
      description: 'Generate your birth chart with precise calculations',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      tag: 'Getting Started',
      cta: 'Create Now',
    },
    {
      id: 'chat',
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'AI Astrologer',
      description: 'Ask anything about your chart and get instant insights',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      tag: 'Popular',
      cta: 'Chat Now',
    },
    {
      id: 'relationship',
      icon: <Heart className="h-6 w-6" />,
      title: 'Compatibility',
      description: 'Check relationship compatibility with others',
      color: 'from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-500/30',
      tag: 'Premium',
      cta: 'Compare',
      premium: true,
    },
    {
      id: 'charts',
      icon: <Calendar className="h-6 w-6" />,
      title: 'My Charts',
      description: 'View and manage all your birth charts',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      tag: 'All Time',
      cta: 'View Charts',
    },
    {
      id: 'forecast',
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Daily Forecast',
      description: 'Get your personalized cosmic predictions',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      tag: 'Daily',
      cta: 'See Forecast',
    },
    {
      id: 'transits',
      icon: <Zap className="h-6 w-6" />,
      title: 'Planetary Transits',
      description: 'Understand current planetary influences',
      color: 'from-yellow-500/20 to-amber-500/20',
      borderColor: 'border-yellow-500/30',
      tag: 'Live',
      cta: 'View Transits',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Explore Features
        </h2>
        <p className="text-muted-foreground">Discover what AstroLord can do for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className={`border-border/50 backdrop-blur-sm bg-gradient-to-br ${feature.color} border-2 ${feature.borderColor} hover:shadow-lg transition-all cursor-pointer group ${
              activeTab === feature.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onNavigate(feature.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`p-2 rounded-lg bg-background/50 group-hover:bg-primary/20 transition-colors`}
                >
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <div className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {feature.tag}
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{feature.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(feature.id);
                }}
                className="w-full group-hover:cosmic-glow"
                variant={activeTab === feature.id ? 'default' : 'outline'}
                size="sm"
              >
                {feature.cta}
                {feature.premium && <Crown className="ml-2 h-3 w-3" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="border-border/50 bg-secondary/5 backdrop-blur-sm mt-6">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p className="flex items-start gap-2">
            <Target className="h-4 w-4 mt-0.5 shrink-0 text-primary" />{' '}
            <span>
              <strong>New here?</strong> Start by creating your birth chart in the "Create Chart"
              section.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-primary" />{' '}
            <span>
              <strong>Have questions?</strong> Use the AI Astrologer to ask anything about your
              chart.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />{' '}
            <span>
              <strong>Privacy first:</strong> All your data is encrypted and private. Only you can
              access your information.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureSpotlight;
