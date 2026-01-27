import { useState, useEffect } from 'react';
import { quotaAPI } from '@/lib/api';

interface PlanQuotas {
    charts: number;
    messages_daily: number;
    messages_hourly: number | null;  // null = unlimited
    reports: number;
}

interface PlanInfo {
    plan_key: string;
    display_name: string;
    duration_days: number;
    quotas: PlanQuotas;
}

interface QuotaPlansResponse {
    plans: PlanInfo[];
}

/**
 * Hook to fetch and cache subscription plan quotas.
 * Quotas are configured in backend .env file and exposed via API.
 */
export function useQuotaPlans() {
    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await quotaAPI.getPlans();
                setPlans(response.data.plans);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch quota plans:', err);
                setError('Failed to load plan information');
                // Use fallback defaults if API fails
                setPlans([
                    {
                        plan_key: 'free',
                        display_name: 'Free',
                        duration_days: 0,
                        quotas: { charts: 2, messages_daily: 25, messages_hourly: 10, reports: 0 }
                    },
                    {
                        plan_key: 'weekly_pass',
                        display_name: 'Weekly Pass',
                        duration_days: 7,
                        quotas: { charts: 5, messages_daily: 200, messages_hourly: null, reports: 4 }
                    },
                    {
                        plan_key: 'monthly_subscription',
                        display_name: 'Monthly Subscription',
                        duration_days: 30,
                        quotas: { charts: 25, messages_daily: 1000, messages_hourly: null, reports: 20 }
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // Helper to get a specific plan's quotas
    const getPlan = (planKey: string) => plans.find(p => p.plan_key === planKey);

    // Get free tier specifically (commonly needed)
    const freePlan = getPlan('free');
    const weeklyPlan = getPlan('weekly_pass');
    const monthlyPlan = getPlan('monthly_subscription');

    return {
        plans,
        isLoading,
        error,
        getPlan,
        freePlan,
        weeklyPlan,
        monthlyPlan,
    };
}
