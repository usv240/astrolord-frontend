import { useQuota } from '@/hooks/useQuota';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, BarChart3, MessageSquare, Timer, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuotaWidget = () => {
  const { quota, isLoading, error, isNearLimit, getRemainingQuota } = useQuota();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load quota: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quota) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No quota data available</div>
        </CardContent>
      </Card>
    );
  }

  const chartsPercentage = Math.min((quota.charts.used / quota.charts.limit) * 100, 100);
  const chartsColor =
    chartsPercentage >= 90
      ? 'bg-red-500'
      : chartsPercentage >= 70
        ? 'bg-yellow-500'
        : 'bg-green-500';

  let primaryMessageLabel: string;
  let messagesUsed: number;
  let messagesLimit: number;

  primaryMessageLabel =
    quota.messages.period === 'daily' ? 'Messages Today' : 'Messages This Period';
  messagesUsed = quota.messages.used;
  messagesLimit = quota.messages.limit;

  const messagesPercentage = Math.min((messagesUsed / messagesLimit) * 100, 100);
  const messagesColor =
    messagesPercentage >= 90
      ? 'bg-red-500'
      : messagesPercentage >= 70
        ? 'bg-yellow-500'
        : 'bg-green-500';

  const showUpgrade = !quota.messages_hourly || isNearLimit('charts') || isNearLimit('messages');
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Charts Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3 w-3" /> Charts Created
            </span>
            <span className="font-semibold">
              {quota.charts.used} / {quota.charts.limit}
            </span>
          </div>
          <Progress value={chartsPercentage} className="h-2" />
          {quota.charts.used >= quota.charts.limit && (
            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-xs text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Chart limit reached - Upgrade to create more</span>
            </div>
          )}
        </div>

        {/* Messages Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> {primaryMessageLabel}
            </span>
            <span className="font-semibold">
              {messagesUsed} / {messagesLimit}
            </span>
          </div>
          <Progress value={messagesPercentage} className="h-2" />
          {messagesUsed >= messagesLimit && (
            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-xs text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Message limit reached - Upgrade for unlimited messaging</span>
            </div>
          )}
        </div>

        {/* Hourly limit for free users */}
        {quota.messages_hourly && (
          <div className="space-y-2 opacity-70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" /> Messages This Hour
              </span>
              <span className="font-medium">
                {quota.messages_hourly.used} / {quota.messages_hourly.limit}
              </span>
            </div>
            <Progress
              value={Math.min(
                (quota.messages_hourly.used / (quota.messages_hourly.limit ?? 1)) * 100,
                100,
              )}
              className="h-1.5"
            />
          </div>
        )}

        {/* Compatibility Chat Usage - Hourly */}
        {quota.messages_compat_hourly && (
          <div className="space-y-2 pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> Compatibility This Hour
              </span>
              <span className="font-medium">
                {quota.messages_compat_hourly.used} / {quota.messages_compat_hourly.limit}
              </span>
            </div>
            <Progress
              value={Math.min(
                (quota.messages_compat_hourly.used / (quota.messages_compat_hourly.limit ?? 1)) *
                  100,
                100,
              )}
              className="h-1.5"
            />
          </div>
        )}

        {/* Compatibility Chat Usage - Daily */}
        {quota.messages_compat_daily && (
          <div className="space-y-2 opacity-70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> Compatibility Today
              </span>
              <span className="font-medium">
                {quota.messages_compat_daily.used} / {quota.messages_compat_daily.limit}
              </span>
            </div>
            <Progress
              value={Math.min(
                (quota.messages_compat_daily.used / (quota.messages_compat_daily.limit ?? 1)) * 100,
                100,
              )}
              className="h-1.5"
            />
          </div>
        )}

        {showUpgrade && (
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Upgrade for More
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
