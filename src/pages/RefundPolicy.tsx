import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, RefreshCw, Clock, CheckCircle, XCircle, Mail, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="cosmic-glow">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10 cosmic-glow">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AstroLord
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <ThemeToggle />
              <Button variant="outline" asChild className="border-border/50">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <RefreshCw className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text">
                Refund Policy
              </h1>
              <p className="text-xl text-muted-foreground">
                Your satisfaction is our priority. Here's our simple refund policy.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: January 12, 2026
              </p>
            </div>

            {/* 7-Day Guarantee */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-500/30 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                3-Day Money-Back Guarantee
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                We stand behind the quality of our service. If you're not completely satisfied with AstroLord,
                you can request a full refund within 3 days of your first subscription purchase.
              </p>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-sm font-semibold text-foreground">
                  ✅ First-time subscribers get a risk-free 3-day trial with our money-back guarantee
                </p>
              </div>
            </div>

            {/* Who Can Request a Refund */}
            <div className="mb-8 p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">Who Can Request a Refund?</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">✅ Eligible for Refund</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>First-time subscribers within <strong className="text-foreground">3 days</strong> of initial purchase</li>
                      <li>Users who have sent <strong className="text-foreground">fewer than 50 messages</strong></li>
                      <li>Users experiencing technical issues we cannot resolve</li>
                      <li>Duplicate or accidental charges</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">❌ Not Eligible for Refund</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Requests made after <strong className="text-foreground">3 days</strong> from purchase date</li>
                      <li>Users who have sent <strong className="text-foreground">50+ messages</strong></li>
                      <li>Renewal subscriptions (only first-time purchases qualify)</li>
                      <li>Users who have previously received a refund (one refund per customer lifetime)</li>
                      <li>Accounts banned for Terms of Service violations</li>
                      <li>Users who filed chargebacks without contacting support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Request a Refund */}
            <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                How to Request a Refund
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Send an Email</h3>
                    <p className="text-muted-foreground">
                      Email us at <a href="mailto:support@astro-lord.com" className="text-primary hover:underline font-semibold">support@astro-lord.com</a> with
                      the subject line: <span className="font-semibold">"Refund Request"</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Include Required Information</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Your registered email address</li>
                      <li>Order/Transaction ID (if available)</li>
                      <li>Date of purchase</li>
                      <li>Brief reason for refund request</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Wait for Confirmation</h3>
                    <p className="text-muted-foreground">
                      We'll review your request within 24-48 hours and send a confirmation email.
                      Refund requests are approved if submitted within the 3-day window and under 50 messages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Receive Your Refund</h3>
                    <p className="text-muted-foreground">
                      Once approved, refunds are processed within 7-10 business days back to your original payment method.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Times */}
            <div className="mb-8 p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-accent" />
                Refund Processing Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">24-48h</div>
                  <div>
                    <div className="font-semibold">Request Review</div>
                    <div className="text-sm text-muted-foreground">We review and approve/deny your request</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="text-2xl font-bold text-secondary">7-10 days</div>
                  <div>
                    <div className="font-semibold">Refund Processing</div>
                    <div className="text-sm text-muted-foreground">Money returned to original payment method</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="text-2xl font-bold text-accent">Varies</div>
                  <div>
                    <div className="font-semibold">Bank Processing</div>
                    <div className="text-sm text-muted-foreground">Additional 3-5 days depending on your bank</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mb-8 p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">Important Notes</h2>

              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-foreground">One Refund Per Customer:</strong> The 3-day guarantee applies only to
                    your first purchase. Only ONE refund is allowed per email address or payment method, lifetime.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-foreground">Account Closure:</strong> Once a refund is processed, your account
                    will be <strong className="text-red-500">permanently closed</strong> and you cannot re-register with the same email.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-foreground">Partial Refunds:</strong> We do not offer partial refunds for unused
                    time within a billing period. Refunds are full amount only.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-foreground">Currency:</strong> Refunds will be issued in the same currency you
                    were charged. Exchange rate differences are not our responsibility.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-foreground">Chargebacks:</strong> Filing a chargeback with your bank without first
                    contacting our support will result in <strong className="text-red-500">permanent ban</strong> from all services.
                  </span>
                </li>
              </ul>
            </div>

            {/* Cancellation vs Refund */}
            <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 backdrop-blur-sm border border-accent/30">
              <h2 className="text-2xl font-bold mb-4">Cancellation vs Refund</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <h3 className="text-lg font-semibold mb-3 text-accent">Cancellation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cancel anytime from your Dashboard → Settings. Your subscription remains active until the end of
                    the current billing period. No refund for remaining time.
                  </p>
                  <Link to="/settings">
                    <Button variant="outline" size="sm" className="w-full">
                      Go to Settings
                    </Button>
                  </Link>
                </div>

                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Refund</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Request within 3 days of first purchase (and under 50 messages) to get your money back.
                    Your account will be permanently closed upon refund approval.
                  </p>
                  <Link to="/contact">
                    <Button size="sm" className="w-full cosmic-glow">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
              <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about our refund policy or need assistance with a refund request,
                please don't hesitate to contact us.
              </p>
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:support@astro-lord.com" className="text-primary hover:underline">
                    support@astro-lord.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Response Time:</strong>{' '}
                  <span className="text-muted-foreground">Within 24-48 hours</span>
                </p>
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>
                For more information, please read our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RefundPolicy;
