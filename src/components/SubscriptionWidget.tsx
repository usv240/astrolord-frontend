import { useSubscription } from '@/hooks/useSubscription';
import { useQuota } from '@/hooks/useQuota';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Gift, Sparkles, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const SubscriptionWidget = () => {
  const { subscription, isLoading, hasActiveSubscription, isExpiringSoon, daysLeft } =
    useSubscription();
  const { quota, isLoading: quotaLoading, refresh: fetchQuota } = useQuota();
  const navigate = useNavigate();

  // Listen for usage updates and refresh quota
  useEffect(() => {
    const handleUsageUpdate = () => {
      fetchQuota(false); // Refresh silently without showing loading state
    };

    window.addEventListener('chatUsageUpdated', handleUsageUpdate);

    return () => {
      window.removeEventListener('chatUsageUpdated', handleUsageUpdate);
    };
  }, [fetchQuota]);

  if (isLoading || quotaLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const planIcons = {
    free: Gift,
    weekly: Zap,
    monthly: Crown,
    premium: Crown,
  };

  const planColors = {
    free: 'from-gray-500 to-gray-600',
    weekly: 'from-blue-500 to-purple-600',
    monthly: 'from-purple-500 to-pink-600',
    premium: 'from-purple-500 to-pink-600',
  };

  const planType = subscription?.plan_type || 'free';
  const Icon = planIcons[planType as keyof typeof planIcons];
  const colorGradient = planColors[planType as keyof typeof planColors];

  if (!hasActiveSubscription) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border-2 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Gift className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Free Plan</h3>
              <p className="text-xs text-muted-foreground">Limited features - Upgrade for more!</p>
            </div>
          </div>

          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charts:</span>
              <span className="font-medium">
                {quota?.charts.used ?? 0} / {quota?.charts.limit ?? 2}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages (Daily):</span>
              <span className="font-medium">
                {quota?.messages.used ?? 0} / {quota?.messages.limit ?? 25}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages (This Hour):</span>
              <span className="font-medium">
                {quota?.messages_hourly?.used ?? 0} / {quota?.messages_hourly?.limit ?? 15}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compatibility (Daily):</span>
              <span className="font-medium">
                {quota?.messages_compat_daily?.used ?? 0} /{' '}
                {quota?.messages_compat_daily?.limit ?? 20}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compatibility (This Hour):</span>
              <span className="font-medium">
                {quota?.messages_compat_hourly?.used ?? 0} /{' '}
                {quota?.messages_compat_hourly?.limit ?? 10}
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  const expiryDate = subscription?.valid_until
    ? new Date(subscription.valid_until).toLocaleDateString()
    : '';

  let expiryText = '';
  if (daysLeft <= 0) {
    expiryText = 'Expired';
  } else if (daysLeft === 1) {
    expiryText = 'Expires today';
  } else if (daysLeft <= 3) {
    expiryText = `Expires in ${daysLeft} days`;
  } else {
    expiryText = `Valid until ${expiryDate}`;
  }

  return (
    <Card
      className={`border-border/50 bg-gradient-to-br ${colorGradient} backdrop-blur-sm ${isExpiringSoon ? 'border-orange-500/50 border-2' : ''}`}
    >
      <CardContent className="p-4 text-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-white/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {planType === 'weekly' ? 'Weekly Pass' : 'Monthly Pass'}
            </h3>
            <p
              className={`text-xs ${isExpiringSoon ? 'text-yellow-200 font-semibold' : 'text-white/80'}`}
            >
              {expiryText}
            </p>
          </div>
        </div>

        <div className="space-y-1 mb-3 text-xs">
          <div className="flex justify-between">
            <span className="text-white/70">Charts:</span>
            <span className="font-medium">
              {subscription.charts_allowed} / {planType === 'weekly' ? 'week' : 'month'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Messages:</span>
            <span className="font-medium">
              {subscription.messages_allowed} / {planType === 'weekly' ? 'week' : 'month'}
            </span>
          </div>
        </div>

        {isExpiringSoon ? (
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-white text-purple-600 hover:bg-white/90"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Renew Now
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/settings')}
            variant="secondary"
            className="w-full bg-white/20 hover:bg-white/30 border-white/20"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" /> Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
