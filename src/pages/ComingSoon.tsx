import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  CreditCard,
  FileText,
  Calendar,
  Bell,
  Users,
  Globe,
  Zap,
  Target,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Clock,
  Rocket,
  Star,
  Heart,
} from 'lucide-react';

// Feature status types
type FeatureStatus = 'coming-soon' | 'in-development' | 'planned' | 'beta';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: FeatureStatus;
  category: string;
  eta?: string;
  highlights?: string[];
}

// Status badge styling
const statusConfig: Record<FeatureStatus, { label: string; className: string }> = {
  'coming-soon': {
    label: 'Coming Soon',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  'in-development': {
    label: 'In Development',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  'planned': {
    label: 'Planned',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  'beta': {
    label: 'Beta',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
};

// Upcoming features data
const upcomingFeatures: Feature[] = [
  {
    id: 'dasha-visualization',
    title: 'Interactive Dasha Timeline',
    description: 'Visualize your Mahadasha, Antardasha, and Pratyantardasha periods with an interactive timeline. See past, present, and future planetary periods at a glance.',
    icon: <TrendingUp className="h-6 w-6" />,
    status: 'in-development',
    category: 'Charts & Analysis',
    eta: 'February 2026',
    highlights: [
      'Visual timeline with zoom controls',
      'Detailed period interpretations',
      'Key life event predictions',
      'Export to PDF',
    ],
  },
  {
    id: 'personal-reports',
    title: 'Personalized PDF Reports',
    description: 'Generate comprehensive, beautifully designed PDF reports of your birth chart, yearly predictions, and compatibility analysis.',
    icon: <FileText className="h-6 w-6" />,
    status: 'coming-soon',
    category: 'Reports',
    eta: 'March 2026',
    highlights: [
      'Birth chart analysis report',
      'Annual forecast report',
      'Relationship compatibility report',
      'Career guidance report',
    ],
  },
  {
    id: 'payment-tiers',
    title: 'Premium Plans & Credits',
    description: 'Flexible payment options including credit packs, monthly subscriptions, and lifetime access with exclusive features.',
    icon: <CreditCard className="h-6 w-6" />,
    status: 'in-development',
    category: 'Payments',
    eta: 'February 2026',
    highlights: [
      'Pay-per-use credits',
      'Monthly unlimited plans',
      'Family sharing (up to 5 charts)',
      'Priority AI responses',
    ],
  },
  {
    id: 'transit-alerts',
    title: 'Transit Notifications',
    description: 'Get notified when important planetary transits affect your chart. Never miss a significant cosmic event again.',
    icon: <Bell className="h-6 w-6" />,
    status: 'planned',
    category: 'Notifications',
    eta: 'Q2 2026',
    highlights: [
      'Daily transit alerts',
      'Major aspect notifications',
      'Retrograde warnings',
      'Custom alert preferences',
    ],
  },
  {
    id: 'divisional-charts',
    title: 'All 16 Divisional Charts',
    description: 'Access all Shodashvarga (16 divisional charts) including D-9 Navamsa, D-10 Dasamsa, D-12 Dwadasamsa, and more.',
    icon: <Target className="h-6 w-6" />,
    status: 'coming-soon',
    category: 'Charts & Analysis',
    eta: 'February 2026',
    highlights: [
      'D-9 Marriage & Dharma',
      'D-10 Career & Profession',
      'D-12 Parents & Ancestry',
      'AI interpretation for each',
    ],
  },
  {
    id: 'muhurta',
    title: 'Muhurta (Auspicious Timing)',
    description: 'Find the most auspicious dates and times for important events like marriage, business launches, travel, and more.',
    icon: <Calendar className="h-6 w-6" />,
    status: 'planned',
    category: 'Tools',
    eta: 'Q2 2026',
    highlights: [
      'Wedding muhurta',
      'Business launch timing',
      'Travel auspiciousness',
      'Custom event planning',
    ],
  },
  {
    id: 'family-charts',
    title: 'Family Chart Management',
    description: 'Store and manage charts for your entire family. Compare charts, check compatibility, and track everyone\'s cosmic weather.',
    icon: <Users className="h-6 w-6" />,
    status: 'planned',
    category: 'Features',
    eta: 'Q2 2026',
    highlights: [
      'Unlimited family charts',
      'Quick switching',
      'Family compatibility grid',
      'Shared daily insights',
    ],
  },
  {
    id: 'learning-paths',
    title: 'Astrology Learning Paths',
    description: 'Structured courses to learn Vedic astrology from basics to advanced. Interactive lessons with your own chart as examples.',
    icon: <BookOpen className="h-6 w-6" />,
    status: 'planned',
    category: 'Education',
    eta: 'Q3 2026',
    highlights: [
      'Beginner to advanced tracks',
      'Video + text lessons',
      'Quizzes & certificates',
      'Learn with your chart',
    ],
  },
  {
    id: 'multi-language',
    title: 'Multi-Language Support',
    description: 'Access AstroLord in Hindi, Tamil, Telugu, Kannada, and more regional languages.',
    icon: <Globe className="h-6 w-6" />,
    status: 'planned',
    category: 'Localization',
    eta: 'Q3 2026',
    highlights: [
      'Hindi',
      'Tamil',
      'Telugu',
      'More coming...',
    ],
  },
  {
    id: 'ai-voice',
    title: 'Voice Chat with AI Astrologer',
    description: 'Talk to our AI astrologer using voice. Ask questions naturally and get spoken responses.',
    icon: <MessageSquare className="h-6 w-6" />,
    status: 'planned',
    category: 'AI Features',
    eta: 'Q4 2026',
    highlights: [
      'Natural voice input',
      'Spoken responses',
      'Multiple voice options',
      'Conversation history',
    ],
  },
];

// Category colors
const categoryColors: Record<string, string> = {
  'Charts & Analysis': 'from-purple-500/20 to-blue-500/20',
  'Reports': 'from-amber-500/20 to-orange-500/20',
  'Payments': 'from-green-500/20 to-emerald-500/20',
  'Notifications': 'from-red-500/20 to-pink-500/20',
  'Tools': 'from-cyan-500/20 to-teal-500/20',
  'Features': 'from-indigo-500/20 to-violet-500/20',
  'Education': 'from-yellow-500/20 to-lime-500/20',
  'Localization': 'from-sky-500/20 to-blue-500/20',
  'AI Features': 'from-fuchsia-500/20 to-pink-500/20',
};

const FeatureCard = memo(({ feature }: { feature: Feature }) => {
  const status = statusConfig[feature.status];
  const gradient = categoryColors[feature.category] || 'from-primary/20 to-secondary/20';

  return (
    <Card className={`group relative overflow-hidden border-border/50 bg-gradient-to-br ${gradient} hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {feature.icon}
          </div>
          <Badge variant="outline" className={`text-[10px] ${status.className}`}>
            {status.label}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
        <CardDescription className="text-sm">{feature.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {feature.highlights && (
          <ul className="space-y-1.5 mb-4">
            {feature.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary/70 shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        )}
        
        {feature.eta && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <Clock className="h-3 w-3" />
            <span>Expected: {feature.eta}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FeatureCard.displayName = 'FeatureCard';

const ComingSoon = memo(() => {
  // Group features by status for summary
  const statusCounts = upcomingFeatures.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Rocket className="h-4 w-4 text-primary animate-bounce" />
            <span className="text-sm font-medium text-primary">Roadmap</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              What's Coming Next
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're constantly working to bring you new features and improvements. 
            Here's a glimpse of what's on our cosmic roadmap.
          </p>

          {/* Status summary */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {Object.entries(statusCounts).map(([status, count]) => {
              const config = statusConfig[status as FeatureStatus];
              return (
                <div key={status} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
                  <div className={`w-2 h-2 rounded-full ${config.className.split(' ')[0].replace('/20', '')}`} />
                  <span className="text-sm text-muted-foreground">{count} {config.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {upcomingFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>

        {/* Suggestion CTA */}
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 py-8">
            <div className="p-4 rounded-full bg-primary/20">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-semibold mb-2">Have a Feature Request?</h3>
              <p className="text-muted-foreground text-sm">
                We'd love to hear your ideas! Your feedback helps us prioritize what to build next.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/contact">
                <Star className="h-4 w-4 mr-2" />
                Suggest a Feature
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Newsletter signup could go here */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Want to be notified when new features launch?</p>
          <Button variant="link" asChild className="text-primary">
            <Link to="/register">Create an account</Link>
          </Button>
          <span> to get updates.</span>
        </div>
      </div>
    </div>
  );
});

ComingSoon.displayName = 'ComingSoon';

export default ComingSoon;
