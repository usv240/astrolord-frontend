import { useState, useEffect } from 'react';
import { paymentAPI, QuotaUsage } from '@/lib/payment-api';

export const useQuota = () => {
  const [quota, setQuota] = useState<QuotaUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await paymentAPI.getQuotaUsage();
      setQuota(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load quota');
      setQuota(null);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Fetch quota on mount with loading state
    fetchQuota(true);
  }, []);

  const isNearLimit = (type: 'charts' | 'messages' = 'messages') => {
    if (!quota) return false;

    if (type === 'charts') {
      const percentage = (quota.charts.used / quota.charts.limit) * 100;
      return percentage >= 80;
    } else {
      const percentage = (quota.messages.used / quota.messages.limit) * 100;
      return percentage >= 80;
    }
  };

  const isQuotaExceeded = (type: 'charts' | 'messages' = 'messages') => {
    if (!quota) return false;

    if (type === 'charts') {
      return quota.charts.used >= quota.charts.limit;
    } else {
      const dailyExceeded = quota.messages.used >= quota.messages.limit;
      const hourlyExceeded = quota.messages_hourly ? 
        (quota.messages_hourly.used >= (quota.messages_hourly.limit ?? Infinity)) : false;
      return dailyExceeded || hourlyExceeded;
    }
  };

  const getRemainingQuota = (type: 'charts' | 'messages' = 'messages') => {
    if (!quota) return 0;

    if (type === 'charts') {
      return quota.charts.remaining;
    } else {
      if (quota.messages_hourly) {
        return Math.min(quota.messages.remaining, quota.messages_hourly.remaining ?? Infinity);
      }
      return quota.messages.remaining;
    }
  };

  return {
    quota,
    isLoading,
    error,
    refresh: fetchQuota,
    isNearLimit,
    isQuotaExceeded,
    getRemainingQuota,
  };
};
