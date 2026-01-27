import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Heart, Sparkles, BarChart3, Lightbulb } from 'lucide-react';
import { NotificationBanner } from './NotificationBanner';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
  userName?: string;
}

export const DashboardHome = ({ onNavigate, userName }: DashboardHomeProps) => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6">
      {/* Notification Banner - shows if notifications not enabled */}
      <NotificationBanner />
      <div>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          {greeting}, {userName || 'there'}! <Sparkles className="h-7 w-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">Your personalized astrology companion</p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => onNavigate('create')}
            className="cosmic-glow h-auto py-6 flex flex-col items-center justify-center"
          >
            <Plus className="h-6 w-6 mb-2" />
            <span>Create Chart</span>
          </Button>
          <Button
            onClick={() => onNavigate('charts')}
            variant="outline"
            className="border-border/50 h-auto py-6 flex flex-col items-center justify-center"
          >
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>My Charts</span>
          </Button>
          <Button
            onClick={() => onNavigate('chat')}
            variant="outline"
            className="border-border/50 h-auto py-6 flex flex-col items-center justify-center"
          >
            <MessageSquare className="h-6 w-6 mb-2" />
            <span>Chat</span>
          </Button>
          <Button
            onClick={() => onNavigate('relationship')}
            variant="outline"
            className="border-border/50 h-auto py-6 flex flex-col items-center justify-center"
          >
            <Heart className="h-6 w-6 mb-2" />
            <span>Relationship</span>
          </Button>
        </div>
      </div>

      {/* Quick Info */}
      <Card className="border-border/50 bg-secondary/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />{' '}
            <span>
              <strong>Tip:</strong> Start by creating your birth chart, then ask our AI astrologer
              anything about it.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
