import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Star,
  Moon,
  Shield,
  Check,
  ArrowRight,
  Zap,
  HelpCircle,
  Target,
  Rocket,
} from 'lucide-react';

import { usePricing } from '@/hooks/use-pricing';
import { useQuotaPlans } from '@/hooks/useQuotaPlans';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSEO } from '@/components/SEO';
import { memo } from 'react';


const Index = memo(() => {
  const { pricing, isLoading: pricingLoading } = usePricing();

  const {
    freePlan,
    weeklyPlan: weeklyQuota,
    monthlyPlan: monthlyQuota,
    isLoading: quotaLoading,
  } = useQuotaPlans();

  // Get pricing for each product (with null safety)
  const pricingList = pricing?.pricing || [];
  const weeklyPlan = pricingList.find((p) => p.product_key === 'weekly_pass');
  const monthlyPlan = pricingList.find((p) => p.product_key === 'monthly_subscription');

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

  return (
    <>
      <PageSEO page="home" />
      <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative z-10">
          <main className="container mx-auto px-4 py-10 sm:py-16 md:py-20">

            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img src="/logo.png" alt="AstroLord" className="h-48 w-auto animate-float" width="192" height="192" loading="eager" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Unlock the Mysteries
                </span>
                <br />
                <span className="text-foreground">of the Cosmos</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Discover your celestial blueprint with precision Vedic astrology. Generate birth
                charts, explore planetary positions, and chat with our AI astrologer trained
                specifically for authentic Vedic accuracy.
              </p>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-primary flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 shrink-0" />{' '}
                  <span>
                    Unlike generic AI models, AstroLord is purpose-built for Vedic astrology with
                    specialized training on classical texts and authentic calculations, delivering
                    accurate, reliable insights.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Button asChild size="lg" className="cosmic-glow text-lg px-8">
                  <Link to="/register">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Your Journey
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 border-border/50">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>

              {/* Roadmap Banner */}
              <div className="pt-6">
                <Link
                  to="/roadmap"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">New</span>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Check out our upcoming features
                  </span>
                  <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-16">
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <Star className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Precise Charts</h3>
                  <p className="text-muted-foreground">
                    Generate accurate Vedic birth charts with divisional charts and dashas
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <Sparkles className="h-10 w-10 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Specialized AI</h3>
                  <p className="text-muted-foreground">
                    Purpose-built AI trained on authentic Vedic texts, not generic astrology models
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <Moon className="h-10 w-10 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Deep Analysis</h3>
                  <p className="text-muted-foreground">
                    Explore planetary periods, transits, and astrological patterns
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <Shield className="h-10 w-10 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                  <p className="text-muted-foreground">
                    Your personal data is encrypted at rest. We prioritize your privacy.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="container mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                  Choose Your Path
                </h2>
                <p className="text-xl text-muted-foreground">Simple, transparent pricing</p>
              </div>

              {pricingLoading ? (
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50"
                    >
                      <Skeleton className="h-8 w-24 mx-auto mb-4" />
                      <Skeleton className="h-12 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-20 mx-auto mb-6" />
                      <div className="space-y-3 mb-8">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {/* Free Plan */}
                  <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">Free</h3>
                      <div className="text-4xl font-bold mb-2">
                        {getCurrencySymbol(pricing?.currency || 'USD')}0
                      </div>
                      <p className="text-muted-foreground">Forever free</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{freePlan?.quotas.charts || 2} birth charts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{freePlan?.quotas.messages_daily || 25} messages per day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{freePlan?.quotas.messages_hourly || 10} messages per hour</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Basic AI insights</span>
                      </li>
                    </ul>
                    <Link to="/register">
                      <Button className="w-full cosmic-glow">Get Started Free</Button>
                    </Link>
                  </div>

                  {/* Weekly Plan - Popular */}
                  <div className="p-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-sm border-2 border-accent hover:cosmic-glow transition-all relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">Weekly</h3>
                      <div className="text-4xl font-bold mb-2">
                        {weeklyPlan
                          ? `${getCurrencySymbol(pricing?.currency || 'USD')}${weeklyPlan.final_price.toFixed(2)}`
                          : '₹59'}
                      </div>
                      <p className="text-muted-foreground">Per week</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{weeklyQuota?.quotas.charts || 5} birth charts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{weeklyQuota?.quotas.messages_daily || 200} messages per day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>No hourly limit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Advanced AI analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <Button disabled className="w-full bg-accent/70 cursor-not-allowed">
                      <Rocket className="h-4 w-4 mr-2" /> Coming Soon
                    </Button>
                  </div>

                  {/* Monthly Plan */}
                  <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                      <div className="text-4xl font-bold mb-2">
                        {monthlyPlan
                          ? `${getCurrencySymbol(pricing?.currency || 'USD')}${monthlyPlan.final_price.toFixed(2)}`
                          : '₹212'}
                      </div>
                      <p className="text-green-500 font-semibold">Save 28%</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{monthlyQuota?.quotas.charts || 25} birth charts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{monthlyQuota?.quotas.messages_daily || 1000} messages per day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>No hourly limit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Advanced AI analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Best value</span>
                      </li>
                    </ul>
                    <Button disabled className="w-full cosmic-glow opacity-70 cursor-not-allowed">
                      <Rocket className="h-4 w-4 mr-2" /> Coming Soon
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" /> Secure payment via Razorpay
              </p>
            </div>

            {/* How It Works Section */}
            <div className="container mx-auto px-6 py-20 bg-card/20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                  How It Works
                </h2>
                <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">1. Sign Up</h3>
                  <p className="text-muted-foreground">
                    Create your free account in seconds. No credit card required.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">2. Create Chart</h3>
                  <p className="text-muted-foreground">
                    Enter your birth details to generate your personalized Vedic chart.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">3. Get Insights</h3>
                  <p className="text-muted-foreground">
                    Chat with our AI astrologer for deep, personalized guidance.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section - Preview */}
            <div className="container mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">Quick answers to common questions</p>
              </div>

              {/* View More FAQs Button */}
              <div className="text-center mb-8">
                <Link to="/faq">
                  <Button
                    variant="outline"
                    className="cosmic-glow border-accent/50 hover:border-accent"
                  >
                    View All FAQs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                {/* FAQ 1 - What is Vedic Astrology */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        What is Vedic astrology and how is it different?
                      </h3>
                      <p className="text-muted-foreground">
                        Vedic astrology (Jyotish) is an ancient Indian system over 5,000 years old
                        that uses sidereal zodiac calculations based on actual star positions, unlike
                        Western astrology which uses tropical zodiac. It provides detailed insights
                        about your life, personality, career, relationships, and future based on
                        precise planetary positions at your birth time and location.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ 2 - AI Accuracy */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        How accurate is the AI astrologer?
                      </h3>
                      <p className="text-muted-foreground">
                        Our AI is trained on thousands of classical Vedic astrology texts and modern
                        interpretations. It uses advanced algorithms to analyze planetary positions,
                        dashas, and transits with 100% mathematical accuracy. While the calculations
                        are precise, astrological interpretation is an art - our AI provides insights
                        based on traditional Vedic principles combined with modern context.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ 3 - Data Security */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Is my personal data secure and private?
                      </h3>
                      <p className="text-muted-foreground">
                        Absolutely! All your personal information, birth details, and chat history are
                        encrypted at rest using AES-256 encryption. We never share, sell, or disclose
                        your data to third parties. Your conversations with the AI are completely
                        private. We comply with international data protection standards and you can
                        delete your data anytime from your account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* View More Link at Bottom */}
              <div className="text-center mt-8">
                <Link
                  to="/faq"
                  className="text-accent hover:text-accent/80 font-semibold inline-flex items-center gap-2"
                >
                  View all {16} frequently asked questions <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
