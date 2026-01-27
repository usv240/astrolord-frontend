import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, UserX, Mail, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Privacy = () => {
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
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-transparent bg-clip-text">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground">
                Your privacy and security are our top priorities
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: January 12, 2026
              </p>
            </div>

            {/* Quick Summary */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/30 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-green-500" />
                Privacy at a Glance
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <strong className="text-foreground">End-to-End Encryption</strong>
                    <p className="text-muted-foreground">All personal data encrypted with AES-256</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <strong className="text-foreground">No Data Sharing</strong>
                    <p className="text-muted-foreground">We never sell or share your information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <strong className="text-foreground">Complete Control</strong>
                    <p className="text-muted-foreground">Delete your data anytime from settings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <strong className="text-foreground">GDPR Compliant</strong>
                    <p className="text-muted-foreground">Full compliance with data protection laws</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8">
              {/* Information We Collect */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  Information We Collect
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Email address (for login and notifications)</li>
                      <li>Name (optional, for personalization)</li>
                      <li>Password (encrypted and never stored in plain text)</li>
                      <li>Account creation date and last login time</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Birth Chart Data</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Date, time, and place of birth (encrypted at rest)</li>
                      <li>Generated astrological charts and calculations</li>
                      <li>Chart names and labels you create</li>
                      <li>Divisional charts and dasha calculations</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Chat History</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Your questions and AI responses (encrypted)</li>
                      <li>Session metadata (timestamps, chart associations)</li>
                      <li>Focus mode selections and conversation context</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Number of charts created and messages sent</li>
                      <li>Feature usage patterns (for improving the service)</li>
                      <li>Device type, browser, and operating system</li>
                      <li>IP address and approximate location (for pricing and security)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Payment Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Subscription type and status</li>
                      <li>Payment transactions (processed by Razorpay - we don't store card details)</li>
                      <li>Billing history and invoices</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-secondary" />
                  How We Use Your Information
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>We use your information only for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Provide Services:</strong> Generate birth charts, power AI consultations, and deliver personalized astrological insights</li>
                    <li><strong className="text-foreground">Account Management:</strong> Authenticate logins, manage subscriptions, and enforce usage quotas</li>
                    <li><strong className="text-foreground">Communication:</strong> Send important account updates, subscription notifications, and daily forecasts (if enabled)</li>
                    <li><strong className="text-foreground">Improve Service:</strong> Analyze usage patterns to enhance features and fix bugs (anonymized data only)</li>
                    <li><strong className="text-foreground">Security:</strong> Detect fraud, prevent abuse, and protect against unauthorized access</li>
                    <li><strong className="text-foreground">Legal Compliance:</strong> Comply with applicable laws and respond to lawful requests</li>
                  </ul>

                  <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-sm font-semibold text-foreground">
                      ✓ We will NEVER use your data for advertising, profiling, or selling to third parties
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-accent" />
                  Data Security
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>We implement industry-leading security measures to protect your data:</p>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Encryption at Rest</h4>
                      <p className="text-sm">All personal data, birth details, and chat history encrypted with AES-256</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Encryption in Transit</h4>
                      <p className="text-sm">HTTPS/TLS for all data transmission between your device and our servers</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Secure Authentication</h4>
                      <p className="text-sm">JWT tokens, password hashing with bcrypt, and OAuth 2.0 support</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Regular Audits</h4>
                      <p className="text-sm">Continuous security monitoring and vulnerability assessments</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm">
                      <strong className="text-foreground">Note:</strong> While we use best-in-class security, no system is 100% secure.
                      Please use a strong, unique password and enable two-factor authentication when available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">Data Sharing & Third Parties</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>We share limited data only with essential service providers:</p>

                  <div className="space-y-3 mt-4">
                    <div className="p-4 rounded-lg bg-background/50 border-l-4 border-primary">
                      <h4 className="font-semibold text-foreground mb-1">Payment Processing</h4>
                      <p className="text-sm">Razorpay handles all payment transactions. We never see or store your card details.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border-l-4 border-secondary">
                      <h4 className="font-semibold text-foreground mb-1">Cloud Hosting</h4>
                      <p className="text-sm">Servers hosted with secure cloud providers with enterprise-grade security and encryption.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border-l-4 border-accent">
                      <h4 className="font-semibold text-foreground mb-1">Astrology Calculations</h4>
                      <p className="text-sm">Third-party APIs for planetary position calculations (birth data sent over encrypted connections).</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm font-semibold text-foreground">
                      ✗ We do NOT share data with advertisers, data brokers, or social media platforms
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <UserX className="h-6 w-6 text-purple-500" />
                  Your Privacy Rights
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>Under GDPR and other privacy laws, you have the following rights:</p>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Access Your Data</h4>
                      <p className="text-sm">Request a copy of all personal data we hold about you</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Correct Your Data</h4>
                      <p className="text-sm">Update inaccurate information from your account settings</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Delete Your Data</h4>
                      <p className="text-sm">Permanently delete your account and all associated data</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Export Your Data</h4>
                      <p className="text-sm">Download your charts, chat history, and account information</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Restrict Processing</h4>
                      <p className="text-sm">Limit how we use your data while keeping your account active</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-2">Withdraw Consent</h4>
                      <p className="text-sm">Opt out of optional data processing at any time</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm">
                      <strong className="text-foreground">To exercise your rights:</strong> Go to Settings → Account →
                      Privacy Controls, or email us at <a href="mailto:support@astro-lord.com" className="text-primary hover:underline">support@astro-lord.com</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cookies */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">Cookies & Tracking</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>We use minimal cookies and local storage for essential functionality:</p>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="text-green-500">✓</div>
                      <div>
                        <strong className="text-foreground">Essential Cookies:</strong> Authentication tokens, session management, theme preferences
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-green-500">✓</div>
                      <div>
                        <strong className="text-foreground">Analytics:</strong> Anonymous usage statistics to improve the service (no personal data)
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-red-500">✗</div>
                      <div>
                        <strong className="text-foreground">Advertising Cookies:</strong> We do NOT use any advertising or tracking cookies
                      </div>
                    </div>
                  </div>

                  <p className="text-sm mt-4">
                    You can disable cookies in your browser settings, but this may affect functionality.
                  </p>
                </div>
              </div>

              {/* Data Retention */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">Data Retention</h2>

                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Active Accounts:</strong> Data retained as long as your account is active</li>
                    <li><strong className="text-foreground">Deleted Accounts:</strong> All personal data permanently deleted within 30 days</li>
                    <li><strong className="text-foreground">Legal Requirements:</strong> Some data may be retained longer to comply with laws (e.g., payment records for tax purposes)</li>
                    <li><strong className="text-foreground">Anonymized Data:</strong> Usage statistics may be kept indefinitely in anonymized form for analytics</li>
                  </ul>
                </div>
              </div>

              {/* Children's Privacy */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    AstroLord is not intended for children under 13 years of age. We do not knowingly collect
                    personal information from children under 13. If you are a parent or guardian and believe your
                    child has provided us with personal information, please contact us immediately.
                  </p>
                  <p>
                    Users aged 13-18 should use the service with parental guidance and consent.
                  </p>
                </div>
              </div>

              {/* Updates to Privacy Policy */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                    When we make significant changes, we will:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Update the "Last updated" date at the top of this page</li>
                    <li>Notify you via email (if you have notifications enabled)</li>
                    <li>Display a prominent notice on the website</li>
                  </ul>
                  <p>
                    Continued use of AstroLord after changes constitutes acceptance of the updated Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  Contact Us
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data,
                    please contact us:
                  </p>
                  <div className="space-y-2 mt-4">
                    <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@astro-lord.com" className="text-primary hover:underline">support@astro-lord.com</a></p>
                    <p><strong className="text-foreground">Support:</strong> <Link to="/contact" className="text-primary hover:underline">Contact Form</Link></p>
                    <p><strong className="text-foreground">Response Time:</strong> We aim to respond within 48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-sm border border-accent/30 text-center">
              <h3 className="text-2xl font-bold mb-4">Your Privacy Matters</h3>
              <p className="text-muted-foreground mb-6">
                We're committed to protecting your personal information and being transparent about our practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/terms">
                  <Button variant="outline" className="border-border/50">
                    Read Terms of Service
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="cosmic-glow">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Privacy;
