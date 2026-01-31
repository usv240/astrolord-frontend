import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { paymentAPI, PricingResponse } from '@/lib/payment-api';
import { useQuotaPlans } from '@/hooks/useQuotaPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, ArrowLeft, Rocket, MessageSquare, BarChart3, Dumbbell, TrendingUp, Heart, Calendar, Target, Zap, Lock, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PromoCodeInput } from '@/components/PromoCodeInput';
import { PageSEO } from '@/components/SEO';
import { createLogger } from '@/utils/logger';
import {
  trackFunnelStep,
  trackSubscriptionStarted,
  trackPaymentFailed,
  trackButtonClick,
  trackConversion,
} from '@/lib/analytics';

const log = createLogger('Pricing');

// Razorpay configuration - UPDATE THIS WITH YOUR KEY
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { freePlan, weeklyPlan: weeklyQuota, monthlyPlan: monthlyQuota } = useQuotaPlans();

  // Currency symbol mapping
  const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      AUD: 'A$',
      CAD: 'C$',
      SGD: 'S$',
      AED: 'د.إ',
    };
    return symbols[currency] || '$';
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const response = await paymentAPI.getPricing();
      setPricing(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load pricing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planType: string) => {
    // Track checkout button click
    trackButtonClick(`subscribe_${planType}`, 'pricing_page');
    trackFunnelStep('subscription', 1, 'checkout_initiated');

    if (!user) {
      trackFunnelStep('subscription', 0, 'login_required');
      navigate('/login');
      return;
    }

    setProcessingPlan(planType);

    try {
      // Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const orderResponse = await paymentAPI.createOrder([planType]);
      const order = orderResponse.data.order;
      
      // Track order created
      trackFunnelStep('subscription', 2, 'order_created');

      // Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.razorpay_amount,
        currency: order.currency,
        name: 'AstroLord',
        description: getPlanDescription(planType),
        order_id: order.razorpay_order_id,
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: async (response: any) => {
          trackFunnelStep('subscription', 3, 'payment_submitted');
          await verifyPayment(response, planType, order.razorpay_amount / 100);
        },
        modal: {
          ondismiss: () => {
            trackFunnelStep('subscription', 0, 'payment_cancelled');
            setProcessingPlan(null);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process.',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      log.error('Checkout error', { error: error.message });
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
      trackPaymentFailed(error.message || 'checkout_error');
      setProcessingPlan(null);
    }
  };

  const verifyPayment = async (razorpayResponse: any, planType: string, amountInRupees: number) => {
    try {
      const response = await paymentAPI.verifyPayment({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });

      if (response.data.verified) {
        // Track successful payment
        trackFunnelStep('subscription', 4, 'payment_verified');
        trackSubscriptionStarted(planType, amountInRupees);
        trackConversion('subscription_purchase', amountInRupees);
        
        // Trigger subscription update
        window.dispatchEvent(new Event('subscription-updated'));

        toast({
          title: 'Payment Successful!',
          description: 'Your subscription is now active.',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      log.error('Verification error', { error: error.message });
      trackPaymentFailed('verification_failed');
      toast({
        title: 'Verification Failed',
        description: 'Payment verification failed. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanDescription = (planType: string) => {
    const descriptions: Record<string, string> = {
      weekly_pass: `Weekly Pass - ${weeklyQuota?.quotas.charts || 5} Charts, ${weeklyQuota?.quotas.messages_daily || 200} Messages`,
      monthly_subscription: `Monthly Subscription - ${monthlyQuota?.quotas.charts || 25} Charts, ${monthlyQuota?.quotas.messages_daily || 1000} Messages`,
    };
    return descriptions[planType] || 'AstroLord Subscription';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const weekly = pricing?.pricing?.find((p) => p.product_key === 'weekly_pass');
  const monthly = pricing?.pricing?.find((p) => p.product_key === 'monthly_subscription');

  return (
    <>
      <PageSEO page="pricing" />
      <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header with Logo and Theme Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="AstroLord" className="h-12 w-auto" />
            </Link>
          </div>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">Unlock the power of AI-driven astrology</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 items-start">
          {/* Free Plan */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">Free Trial</CardTitle>
              <div className="text-4xl font-bold mt-2">
                {pricing?.currency} 0
              </div>
              <p className="text-sm text-muted-foreground">Forever free</p>
              <CardDescription className="mt-2">Perfect for trying out AstroLord</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">{freePlan?.quotas.charts || 2} Birth Charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">
                    {freePlan?.quotas.messages_daily || 25} AI Messages per Day
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">
                    {freePlan?.quotas.messages_hourly || 10} Messages per Hour
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">All Basic Features</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/register')} variant="outline" className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          {weekly && (
            <Card className="border-secondary/50 bg-gradient-to-br from-secondary/5 to-card/50 backdrop-blur-sm hover:border-secondary/70 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Weekly Pass</CardTitle>
                <div className="text-4xl font-bold mt-2">
                  {getCurrencySymbol(pricing?.currency || 'USD')}
                  {weekly.final_price.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">per week</p>
                {weekly.tax_amount > 0 && (
                  <CardDescription className="mt-1">
                    Incl. {getCurrencySymbol(pricing?.currency || 'USD')}
                    {weekly.tax_amount.toFixed(2)} tax
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">
                      {weeklyQuota?.quotas.charts || 5} Charts per Week
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">
                      {weeklyQuota?.quotas.messages_daily || 200} Messages per Day
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">No Hourly Limits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">All Premium Features</span>
                  </li>
                </ul>
                <Button
                  disabled
                  className="w-full bg-secondary/20 text-secondary border border-secondary/30 cursor-not-allowed"
                >
                  <Clock className="h-4 w-4 mr-2" /> Coming Soon
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Monthly Plan - FEATURED */}
          {monthly && (
            <Card className="border-accent border-2 bg-gradient-to-br from-accent/10 via-primary/5 to-card/50 backdrop-blur-sm relative md:scale-105 md:-translate-y-2 shadow-2xl shadow-accent/20 hover:shadow-accent/30 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-accent to-primary text-black font-bold px-4 py-1 shadow-lg">
                  ⭐ RECOMMENDED
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4 mx-auto ring-4 ring-accent/20">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-2xl text-center">Monthly Pass</CardTitle>
                <div className="text-5xl font-bold mt-2 text-center bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  {getCurrencySymbol(pricing?.currency || 'USD')}
                  {monthly.final_price.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground text-center">per month</p>
                {monthly.tax_amount > 0 && (
                  <CardDescription className="mt-1 text-center">
                    Incl. {getCurrencySymbol(pricing?.currency || 'USD')}
                    {monthly.tax_amount.toFixed(2)} tax
                  </CardDescription>
                )}
                <div className="flex justify-center mt-2">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Save 28% vs weekly
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-medium">
                      {monthlyQuota?.quotas.charts || 25} Charts per Month
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-medium">
                      {monthlyQuota?.quotas.messages_daily || 1000} Messages per Day
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-medium">Unlimited Hourly Messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-medium">Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-bold text-accent">Best Value!</span>
                  </li>
                </ul>
                <Button
                  disabled
                  className="w-full bg-gradient-to-r from-accent to-primary text-black font-semibold cursor-not-allowed opacity-80"
                >
                  <Rocket className="h-4 w-4 mr-2" /> Coming Soon
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  🔔 Get notified when payments launch
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Promo Code Section */}
        <div className="max-w-md mx-auto mb-12">
          <PromoCodeInput
            onRedeemSuccess={() => {
              toast({
                title: '🎉 Reward Applied!',
                description: 'Check your dashboard to see your new benefits.',
              });
            }}
          />
        </div>

        {/* Features Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6" /> All Plans Include
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: <MessageSquare className="h-8 w-8" />,
                  title: 'AI Chat',
                  desc: 'Talk to our AI astrologer',
                },
                {
                  icon: <BarChart3 className="h-8 w-8" />,
                  title: 'Birth Charts',
                  desc: 'D1 + 20+ divisional charts',
                },
                {
                  icon: <Dumbbell className="h-8 w-8" />,
                  title: 'Shadbala',
                  desc: '6-fold planetary strength',
                },
                {
                  icon: <TrendingUp className="h-8 w-8" />,
                  title: 'Current Transits',
                  desc: 'Live planetary movements',
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: 'Vedic Remedies',
                  desc: 'Personalized remedies',
                },
                {
                  icon: <Calendar className="h-8 w-8" />,
                  title: 'Daily Forecasts',
                  desc: 'Personalized predictions',
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: 'Compatibility',
                  desc: 'Relationship analysis',
                },
                {
                  icon: <Target className="h-8 w-8" />,
                  title: '10 Focus Modes',
                  desc: 'Career, wealth, health & more',
                },
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: 'Dasha Timeline',
                  desc: '120-year predictions',
                },
                {
                  icon: <Sparkles className="h-8 w-8" />,
                  title: 'Yoga Detection',
                  desc: '40+ combinations',
                },
                {
                  icon: <Lock className="h-8 w-8" />,
                  title: 'Encryption',
                  desc: 'Your data is secure',
                },
              ].map((feature, idx) => (
                <div key={idx} className="text-center">
                  <div className="mb-2 flex justify-center text-primary">{feature.icon}</div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Pricing;
