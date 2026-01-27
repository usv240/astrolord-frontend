import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, AlertTriangle, Ban, UserCheck, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Terms = () => {
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
              <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text">
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground">
                Please read these terms carefully before using AstroLord
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: January 12, 2026
              </p>
            </div>

            {/* Important Notice */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/30 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                Important Notice
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  By accessing or using AstroLord, you agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <p>
                  If you do not agree to these terms, please do not use our service. These terms constitute a legally binding
                  agreement between you and AstroLord.
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* 1. Acceptance of Terms */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    These Terms of Service ("Terms") govern your access to and use of AstroLord's website, mobile applications,
                    and related services (collectively, the "Service"). By creating an account or using the Service, you acknowledge
                    that you have read, understood, and agree to be bound by these Terms.
                  </p>
                  <p>
                    If you are using the Service on behalf of an organization, you represent and warrant that you have the authority
                    to bind that organization to these Terms.
                  </p>
                </div>
              </div>

              {/* 2. Service Description */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    AstroLord provides Vedic astrology services including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Birth chart generation based on Vedic astrological principles</li>
                    <li>AI-powered astrological consultations and interpretations</li>
                    <li>Planetary period (Dasha) calculations and predictions</li>
                    <li>Compatibility analysis and relationship insights</li>
                    <li>Daily, weekly, and monthly astrological forecasts</li>
                    <li>Remedial measures and spiritual guidance</li>
                  </ul>

                  <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm font-semibold text-foreground">
                      ⚠️ Disclaimer: AstroLord is provided for entertainment, educational, and informational purposes only.
                      Astrological insights should not be used as a substitute for professional medical, legal, financial,
                      or psychological advice.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. User Accounts */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-primary" />
                  3. User Accounts
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Account Creation</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You must be at least 13 years old to create an account</li>
                      <li>Users aged 13-18 must have parental consent</li>
                      <li>You must provide accurate and complete information</li>
                      <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                      <li>One person may not maintain multiple free accounts</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Account Security</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You are solely responsible for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized access or security breach</li>
                      <li>We are not liable for losses from unauthorized account use</li>
                      <li>You must not share your account with others</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Account Termination</h3>
                    <p>
                      You may delete your account at any time from Settings. We may suspend or terminate accounts that violate
                      these Terms, with or without notice.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Subscription & Billing */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">4. Subscription & Billing</h2>

                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Free Plan</h3>
                    <p>
                      The free plan includes limited birth charts and messages per day. Free plan features may be modified
                      or discontinued at any time without notice. See our <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link> for current limits.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Paid Subscriptions</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Weekly and Monthly subscription plans are available</li>
                      <li>Subscriptions automatically renew unless cancelled</li>
                      <li>You authorize us to charge your payment method for renewal</li>
                      <li>Price changes will be communicated 30 days in advance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Payments</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Payments are processed securely through Razorpay</li>
                      <li>All fees are in the currency displayed at checkout</li>
                      <li>Taxes may be added based on your location</li>
                      <li>Payment failures may result in service suspension</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Cancellation</h3>
                    <p>
                      You may cancel your subscription anytime from your dashboard. Cancellation takes effect at the end of
                      the current billing period. No partial refunds for unused time.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Refund Policy</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong className="text-foreground">3-Day Money-Back Guarantee:</strong> First-time subscribers may request a full refund within 3 days of purchase</li>
                      <li>Refund requests must be submitted via email to support@astro-lord.com</li>
                      <li>After 3 days, subscriptions are non-refundable</li>
                      <li><strong className="text-foreground">Usage Limit:</strong> Refund eligibility is void if you exceed 50 messages during the trial period</li>
                      <li><strong className="text-foreground">One Refund Per Customer:</strong> Only ONE refund is allowed per email address or payment method, lifetime</li>
                      <li>Refunds processed within 7-10 business days</li>
                      <li><strong className="text-foreground">Account Termination:</strong> Users who receive a refund will have their account permanently closed and cannot re-register</li>
                      <li><strong className="text-foreground">Chargebacks:</strong> Filing a chargeback without contacting support first will result in permanent ban from all services</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5. Acceptable Use */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Ban className="h-6 w-6 text-red-500" />
                  5. Acceptable Use Policy
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>You agree NOT to:</p>

                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the Service for any illegal or unauthorized purpose</li>
                    <li>Violate any laws in your jurisdiction</li>
                    <li>Impersonate any person or entity</li>
                    <li>Harass, abuse, or harm another person</li>
                    <li>Share content that is defamatory, obscene, or offensive</li>
                    <li>Attempt to gain unauthorized access to the Service</li>
                    <li>Interfere with or disrupt the Service or servers</li>
                    <li>Use automated systems (bots, scrapers) to access the Service</li>
                    <li>Reverse engineer or decompile any part of the Service</li>
                    <li>Resell or redistribute the Service without permission</li>
                    <li>Create multiple accounts to circumvent usage limits</li>
                    <li>Upload viruses, malware, or harmful code</li>
                  </ul>

                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm font-semibold text-foreground">
                      Violation of this policy may result in immediate account suspension or termination without refund.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Intellectual Property */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">6. Intellectual Property Rights</h2>

                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Our Content</h3>
                    <p>
                      All content, features, and functionality of the Service (including but not limited to text, graphics,
                      logos, icons, images, audio, video, software, and data compilations) are owned by AstroLord and protected
                      by international copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Your Content</h3>
                    <p>
                      You retain ownership of your birth data and personal information. By using the Service, you grant us
                      a limited license to process your data solely for providing astrological services.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Restrictions</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You may not copy, modify, or create derivative works of our content</li>
                      <li>You may not sell, license, or exploit our content commercially</li>
                      <li>Screenshots and charts generated are for personal use only</li>
                      <li>You may not remove copyright or proprietary notices</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 7. AI Content & Model Training */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  7. AI-Generated Content & Model Training
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Disclaimer</h3>
                    <p className="text-sm">
                      AstroLord uses artificial intelligence to provide astrological interpretations and insights.
                      AI-generated content is based on computational analysis of astrological data and classical texts.
                      <strong className="text-foreground"> AI responses are NOT a substitute for human judgment or professional advice.</strong>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nature of AI Content</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>AI interpretations are probabilistic and may not be 100% accurate</li>
                      <li>Responses may vary for similar questions due to AI generation nature</li>
                      <li>AI cannot predict future events with certainty</li>
                      <li>Content reflects traditional Vedic astrology principles, not scientific claims</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Your Data & AI Training</h3>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-sm font-semibold text-foreground">
                        ✓ Your personal data, birth details, and conversations are NEVER used to train our AI models.
                      </p>
                      <p className="text-sm mt-2">
                        We use only anonymized, aggregated patterns to improve interpretation quality.
                        Your private information remains encrypted and is not shared with any AI training pipelines.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Service Availability */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">8. Service Availability & Uptime</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    While we strive to provide reliable service, we do not guarantee uninterrupted access:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">No Uptime Guarantee:</strong> The Service may experience downtime for maintenance, updates, or unforeseen technical issues</li>
                    <li><strong className="text-foreground">Scheduled Maintenance:</strong> We may perform scheduled maintenance with or without prior notice</li>
                    <li><strong className="text-foreground">Third-Party Dependencies:</strong> Service availability depends on third-party providers (cloud hosting, payment processors, astrology APIs)</li>
                    <li><strong className="text-foreground">No Liability for Downtime:</strong> We are not liable for any losses due to service interruptions or unavailability</li>
                  </ul>
                  <p>
                    We will make reasonable efforts to restore service promptly during any outages.
                  </p>
                </div>
              </div>

              {/* 9. International Users */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">9. International Users</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    AstroLord is operated from India and is intended for a global audience. By using the Service from outside India, you acknowledge:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Data Transfer:</strong> Your data may be transferred to and stored on servers located in India or other countries</li>
                    <li><strong className="text-foreground">Local Laws:</strong> You are responsible for compliance with your local laws regarding online services and data privacy</li>
                    <li><strong className="text-foreground">Currency:</strong> Prices are displayed in your local currency where supported; all transactions are processed in the currency shown at checkout</li>
                    <li><strong className="text-foreground">Regional Restrictions:</strong> Some features may not be available in all countries due to regulatory requirements</li>
                  </ul>
                  <p>
                    We comply with applicable international data protection regulations, including GDPR for European users.
                  </p>
                </div>
              </div>

              {/* 10. Indemnification */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    You agree to indemnify, defend, and hold harmless AstroLord, its officers, directors, employees, agents,
                    licensors, and service providers from and against any claims, liabilities, damages, judgments, awards,
                    losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your violation of these Terms of Service</li>
                    <li>Your use or misuse of the Service</li>
                    <li>Your violation of any third-party rights, including intellectual property rights</li>
                    <li>Any content you submit through the Service</li>
                    <li>Your violation of any applicable laws or regulations</li>
                    <li>Decisions you make based on astrological information provided by the Service</li>
                  </ul>
                  <p>
                    This indemnification obligation will survive the termination of your account and these Terms.
                  </p>
                </div>
              </div>

              {/* 11. Disclaimers */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  11. Disclaimers & Limitations
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Entertainment Purposes</h3>
                    <p className="text-sm">
                      AstroLord is provided FOR ENTERTAINMENT, EDUCATIONAL, AND INFORMATIONAL PURPOSES ONLY. Astrological
                      predictions and insights should not be used as a substitute for professional advice in medical, legal,
                      financial, psychological, or any other professional matter.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Guarantees</h3>
                    <p className="text-sm">
                      We make no warranties, express or implied, regarding the accuracy, reliability, or completeness of
                      astrological information. Astrology is a traditional practice, and interpretations may vary. We do not
                      guarantee specific outcomes or results from using the Service.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <h3 className="text-lg font-semibold text-foreground mb-2">"As Is" Service</h3>
                    <p className="text-sm">
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL
                      WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                      NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted, error-free, or secure.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Limitation of Liability</h3>
                    <p className="text-sm">
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, ASTROLORD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                      SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                      DIRECTLY OR INDIRECTLY. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS
                      PRECEDING THE CLAIM.
                    </p>
                  </div>
                </div>
              </div>

              {/* 8. Privacy */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">12. Privacy & Data Protection</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Your privacy is important to us. Our collection, use, and protection of your personal information is
                    governed by our <Link to="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>,
                    which is incorporated into these Terms by reference.
                  </p>
                  <p>
                    By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
                  </p>
                </div>
              </div>

              {/* 9. Modifications */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">13. Modifications to Service & Terms</h2>

                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Service Changes</h3>
                    <p>
                      We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or
                      without notice. We will not be liable for any modification, suspension, or discontinuation.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Terms Changes</h3>
                    <p>
                      We may revise these Terms from time to time. We will notify you of material changes via email or
                      prominent notice on the website. Continued use after changes constitutes acceptance of the revised Terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* 10. Termination */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">14. Termination</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    We may terminate or suspend your account and access to the Service immediately, without prior notice or
                    liability, for any reason, including breach of these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will immediately cease. All provisions of these Terms
                    which by their nature should survive termination shall survive, including ownership provisions, warranty
                    disclaimers, and limitations of liability.
                  </p>
                </div>
              </div>

              {/* 11. Governing Law */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">15. Governing Law & Dispute Resolution</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to
                    its conflict of law provisions.
                  </p>
                  <p>
                    Any disputes arising from these Terms or use of the Service shall be resolved through binding arbitration
                    in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in English
                    in Bangalore, India.
                  </p>
                  <p>
                    You agree to waive any right to a jury trial or to participate in a class action lawsuit.
                  </p>
                </div>
              </div>

              {/* 12. Miscellaneous */}
              <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl font-bold mb-4">16. Miscellaneous</h2>

                <div className="space-y-3 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Entire Agreement:</strong> These Terms and Privacy Policy constitute the entire agreement between you and AstroLord</li>
                    <li><strong className="text-foreground">Severability:</strong> If any provision is found invalid, the remaining provisions remain in effect</li>
                    <li><strong className="text-foreground">Waiver:</strong> Failure to enforce any right does not waive that right</li>
                    <li><strong className="text-foreground">Assignment:</strong> You may not assign these Terms; we may assign without restriction</li>
                    <li><strong className="text-foreground">No Agency:</strong> Nothing creates a partnership, agency, or employment relationship</li>
                    <li><strong className="text-foreground">Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
                  </ul>
                </div>
              </div>

              {/* 13. Contact */}
              <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  17. Contact Information
                </h2>

                <div className="space-y-3 text-muted-foreground">
                  <p>
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 mt-4">
                    <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@astro-lord.com" className="text-primary hover:underline">support@astro-lord.com</a></p>
                    <p><strong className="text-foreground">Support:</strong> <Link to="/contact" className="text-primary hover:underline">Contact Form</Link></p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-sm border border-accent/30 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                By creating an account, you agree to these Terms and our Privacy Policy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/privacy">
                  <Button variant="outline" className="border-border/50">
                    Read Privacy Policy
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

export default Terms;
