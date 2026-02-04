import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  Heart,
  Home,
  LogOut,
  Crown,
  Gift,
  BarChart3,
  Timer,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuota } from '@/hooks/useQuota';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export const DashboardNav = ({ activeTab, onTabChange, onLogout }: DashboardNavProps) => {
  const navigate = useNavigate();
  const { subscription, hasActiveSubscription, isLoading } = useSubscription();
  const { quota, isLoading: quotaLoading, refresh: fetchQuota } = useQuota();

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

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'relationship', label: 'Match', icon: Heart },
    { id: 'roadmap', label: 'Roadmap', icon: Rocket, isLink: true, href: '/roadmap' },
  ];

  const planType = subscription?.plan_type || 'free';
  const isPremium = hasActiveSubscription && planType !== 'free';

  return (
    <div className="space-y-4 sticky top-4 flex flex-col h-[calc(100vh-8rem)]">
      {/* Navigation */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          // Handle external links (like roadmap)
          if (item.isLink && item.href) {
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start hover:translate-x-1 text-primary/80 hover:text-primary"
                asChild
              >
                <a href={item.href}>
                  <Icon className="h-4 w-4 mr-2 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">New</span>
                </a>
              </Button>
            );
          }

          return (
            <Button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start relative transition-all duration-200 ${isActive ? 'cosmic-glow bg-primary' : 'hover:translate-x-1'}`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full -ml-[1px]" />
              )}
              <Icon className={`h-4 w-4 mr-2 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Spacer to push plan card and logout to bottom */}
      <div className="flex-1" />

      {/* Plan & Usage Indicator */}
      {!isLoading && (
        <Card
          className={`border-border/50 ${isPremium ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-muted/30'}`}
        >
          <CardContent className="p-3 space-y-3">
            {/* Plan Type */}
            <div className="flex items-center gap-2">
              {isPremium ? (
                <Crown className="h-4 w-4 text-purple-400" />
              ) : (
                <Gift className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {isPremium ? (planType === 'weekly' ? 'Weekly' : 'Monthly') : 'Free Plan'}
              </span>
            </div>

            {/* Quota Display */}
            {!quotaLoading && quota && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-3 w-3" /> Charts
                  </span>
                  <span className="font-medium text-foreground">
                    {quota.charts.used} / {quota.charts.limit}
                  </span>
                </div>

                {/* Normal Messages - Daily (shows combined limit if promo active) */}
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Messages
                  </span>
                  <span className="font-medium text-foreground">
                    {quota.messages.used} /{' '}
                    {quota.messages.limit + (quota.promo_bonus?.daily_messages || 0)}
                  </span>
                </div>

                {/* Normal Messages - Hourly (show ∞ if promo grants unlimited hourly) */}
                {quota.messages_hourly && (
                  <div className="flex justify-between text-muted-foreground opacity-70">
                    <span className="flex items-center gap-2">
                      <Timer className="h-3 w-3" /> This Hour
                    </span>
                    <span className="font-medium text-foreground">
                      {quota.promo_bonus?.hourly_messages === null ? (
                        <>{quota.messages_hourly.used} / ∞</>
                      ) : (
                        <>
                          {quota.messages_hourly.used} / {quota.messages_hourly.limit}
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* NOTE: Relationship chat now uses the same counters as regular chat */}

                {/* Promo Bonus Active */}
                {quota.promo_bonus && (
                  <div className="pt-1 border-t border-border/30 space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Gift className="h-3 w-3" /> Promo Bonus
                      </span>
                      <span className="font-medium text-green-500">
                        +{quota.promo_bonus.daily_messages}/day
                        {quota.promo_bonus.hourly_messages === null && ' (∞/hr)'}
                      </span>
                    </div>
                    {quota.promo_bonus.expires_at && (
                      <div className="text-[10px] text-muted-foreground/70">
                        Active until: {new Date(quota.promo_bonus.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upgrade Button */}
            {!isPremium && (
              <Button
                onClick={() => navigate('/pricing')}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-xs h-7"
              >
                <Sparkles className="h-3 w-3 mr-2" /> Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      {onLogout && (
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start border-border/50 text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      )}
    </div>
  );
};

export default DashboardNav;
