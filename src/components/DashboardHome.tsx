import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare, Heart, Sparkles, BarChart3, Lightbulb, Clock, Star, TrendingUp } from 'lucide-react';
import { NotificationBanner } from './NotificationBanner';
import { useQuota } from '@/hooks/useQuota';
import { chartAPI } from '@/lib/api';
import { createLogger } from '@/utils/logger';

const log = createLogger('DashboardHome');

// Safe date formatting helper
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};


interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
  userName?: string;
}

interface RecentChart {
  chart_id: string;
  name: string;
  created_at: string;
}

export const DashboardHome = ({ onNavigate, userName }: DashboardHomeProps) => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const { quota, isLoading: quotaLoading } = useQuota();
  const [recentCharts, setRecentCharts] = useState<RecentChart[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCharts = async () => {
      try {
        const response = await chartAPI.getMyCharts(3);
        // Get the 3 most recent charts
        const charts = response.data.charts || [];
        setRecentCharts(charts);
      } catch (error) {
        log.error('Failed to load charts', { error: String(error) });
      } finally {
        setChartsLoading(false);
      }
    };
    fetchRecentCharts();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Notification Banner - shows if notifications not enabled */}
      <NotificationBanner />

      {/* Welcome Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
          {greeting}, {userName || 'there'}! <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-primary animate-pulse" />
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Your personalized astrology companion</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {quotaLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50 bg-card/30">
                <CardContent className="p-3 sm:p-4">
                  <Skeleton className="h-3 sm:h-4 w-14 sm:w-16 mb-1.5 sm:mb-2" />
                  <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Charts
                </div>
                <div className="text-lg sm:text-xl font-bold">
                  {quota?.charts.used || 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">/{quota?.charts.limit || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                  <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Messages Today
                </div>
                <div className="text-lg sm:text-xl font-bold">
                  {quota?.messages.used || 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">/{quota?.messages.limit || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> This Hour
                </div>
                <div className="text-lg sm:text-xl font-bold">
                  {quota?.messages_hourly?.used || 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                    /{quota?.messages_hourly?.limit === null ? '∞' : quota?.messages_hourly?.limit || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                  <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Plan
                </div>
                <div className="text-lg sm:text-xl font-bold capitalize">
                  {quota?.promo_bonus ? 'Bonus' : 'Free'}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <h2 className="text-base sm:text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Button
            onClick={() => onNavigate('create')}
            className="cosmic-glow h-auto py-4 sm:py-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
            <span className="text-xs sm:text-sm">Create Chart</span>
          </Button>
          <Button
            onClick={() => onNavigate('charts')}
            variant="outline"
            className="border-border/50 h-auto py-4 sm:py-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
            <span className="text-xs sm:text-sm">My Charts</span>
          </Button>
          <Button
            onClick={() => onNavigate('chat')}
            variant="outline"
            className="border-border/50 h-auto py-4 sm:py-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
            <span className="text-xs sm:text-sm">Chat</span>
          </Button>
          <Button
            onClick={() => onNavigate('relationship')}
            variant="outline"
            className="border-border/50 h-auto py-4 sm:py-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2" />
            <span className="text-xs sm:text-sm">Match</span>
          </Button>
        </div>
      </div>

      {/* Recent Charts */}
      <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <h2 className="text-base sm:text-lg font-semibold">Recent Charts</h2>
        {chartsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50 bg-card/30">
                <CardContent className="p-3 sm:p-4">
                  <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-1.5 sm:mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentCharts.length === 0 ? (
          <Card className="border-border/50 bg-card/30 border-dashed">
            <CardContent className="py-6 sm:py-8 text-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-xs sm:text-sm">No charts yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
            {recentCharts.map((chart) => (
              <Card
                key={chart.chart_id}
                className="border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30 cursor-pointer transition-all duration-200"
                onClick={() => onNavigate('charts')}
              >
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-medium text-sm sm:text-base truncate">{chart.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Created {formatDate(chart.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Info */}
      <Card className="border-border/50 bg-secondary/5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
          <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-amber-500 shrink-0" />{' '}
            <span>
              <strong>Tip:</strong> Start by creating your birth chart, then ask our AI astrologer anything.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
