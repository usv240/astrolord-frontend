import { useState, useEffect } from 'react';
import { paymentAPI, SubscriptionStatus } from '@/lib/payment-api';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await paymentAPI.getSubscriptionStatus();
      setSubscription(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message || 'Failed to load subscription');
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSubscription, 5 * 60 * 1000);

    // Listen for subscription updates
    const handleUpdate = () => fetchSubscription();
    window.addEventListener('subscription-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('subscription-updated', handleUpdate);
    };
  }, []);

  const hasActiveSubscription = () => {
    return subscription?.has_active_subscription ?? false;
  };

  const isExpiringSoon = () => {
    if (!subscription?.days_remaining) return false;
    return subscription.days_remaining <= 3 && subscription.days_remaining > 0;
  };

  const getDaysLeft = () => {
    return subscription?.days_remaining ?? 0;
  };

  return {
    subscription,
    isLoading,
    error,
    refresh: fetchSubscription,
    hasActiveSubscription: hasActiveSubscription(),
    isExpiringSoon: isExpiringSoon(),
    daysLeft: getDaysLeft(),
  };
};
