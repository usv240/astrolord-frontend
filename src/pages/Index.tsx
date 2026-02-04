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
  Target,
} from 'lucide-react';

import { PageSEO } from '@/components/SEO';
import { memo } from 'react';


const Index = memo(() => {



  return (
    <>
      <PageSEO page="home" />
      <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        <div className="relative z-10">
          <main className="container mx-auto px-4 py-8 sm:py-16 md:py-20">

            <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
              <div className="flex justify-center mb-4 sm:mb-8">
                <img src="/logo.png" alt="AstroLord" className="h-32 sm:h-48 w-auto animate-float" width="192" height="192" loading="eager" />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Unlock the Mysteries
                </span>
                <br />
                <span className="text-foreground">of the Cosmos</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
                Discover your celestial blueprint with precision Vedic astrology and AI insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 sm:pt-8 w-full sm:w-auto px-4 sm:px-0">
                <Button asChild size="lg" className="cosmic-glow text-base sm:text-lg px-8 w-full sm:w-auto">
                  <Link to="/register">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Your Journey
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-8 border-border/50 w-full sm:w-auto">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>

              {/* Roadmap Banner */}
              <div className="pt-4">
                <Link
                  to="/roadmap"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">New</span>
                  <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Check out our upcoming features
                  </span>
                  <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              {/* Features Grid - 2 cols on mobile */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-12 text-left sm:text-center">
                <div className="p-4 sm:p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mx-auto" />
                  <h3 className="text-base sm:text-xl font-semibold mb-1">Precise Charts</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Accurate Vedic birth & divisional charts
                  </p>
                </div>

                <div className="p-4 sm:p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-secondary mb-3 sm:mx-auto" />
                  <h3 className="text-base sm:text-xl font-semibold mb-1">Specialized AI</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Trained on authentic Vedic texts
                  </p>
                </div>

                <div className="p-4 sm:p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <Moon className="h-8 w-8 sm:h-10 sm:w-10 text-accent mb-3 sm:mx-auto" />
                  <h3 className="text-base sm:text-xl font-semibold mb-1">Deep Analysis</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Planetary periods, transits & dashas
                  </p>
                </div>

                <div className="p-4 sm:p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mb-3 sm:mx-auto" />
                  <h3 className="text-base sm:text-xl font-semibold mb-1">Secure & Private</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Encrypted data & privacy priority
                  </p>
                </div>
              </div>
            </div>

            {/* Simplified Pricing Callout - Centralized to /pricing */}
            <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 mt-8 rounded-2xl bg-gradient-to-br from-card/30 to-primary/5 border border-border/50">
              <div className="text-center max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose the plan that fits your journey. Start for free, upgrade when you're ready.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-green-500/10"><Check className="h-4 w-4 text-green-500" /></div>
                    <span className="text-sm font-medium">Free Forever Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-green-500/10"><Check className="h-4 w-4 text-green-500" /></div>
                    <span className="text-sm font-medium">Weekly Passes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-green-500/10"><Check className="h-4 w-4 text-green-500" /></div>
                    <span className="text-sm font-medium">Monthly Subscriptions</span>
                  </div>
                </div>
                <Button asChild size="lg" className="cosmic-glow">
                  <Link to="/pricing">View Plans & Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Secure payment via Razorpay • Cancel anytime
                </p>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-card/20">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                  How It Works
                </h2>
                <p className="text-muted-foreground">Three simple steps to cosmic clarity</p>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-12 max-w-5xl mx-auto">
                {/* Step 1 */}
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 p-4 rounded-lg bg-card/40 md:bg-transparent border border-border/30 md:border-none text-left md:text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/20 flex items-center justify-center shrink-0 md:mx-auto md:mb-4">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 md:mb-2 text-foreground">1. Sign Up</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your free account instantly.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 p-4 rounded-lg bg-card/40 md:bg-transparent border border-border/30 md:border-none text-left md:text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 md:mx-auto md:mb-4">
                    <Star className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 md:mb-2 text-foreground">2. Create Chart</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter birth details for your Vedic chart.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 p-4 rounded-lg bg-card/40 md:bg-transparent border border-border/30 md:border-none text-left md:text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 md:mx-auto md:mb-4">
                    <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 md:mb-2 text-foreground">3. Get Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat with AI for personalized guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="text-center mb-8 pb-12">
              <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
              <div className="space-y-4 max-w-2xl mx-auto px-4">
                <p className="text-muted-foreground text-sm">
                  Learn about Vedic astrology accuracy, our privacy commitment, and AI capabilities.
                </p>
                <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                  <Link to="/faq">Read Frequently Asked Questions <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
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
