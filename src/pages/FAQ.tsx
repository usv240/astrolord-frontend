import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageSEO } from '@/components/SEO';

const FAQ = () => {
  const faqs = [
    {
      question: "What is Vedic astrology and how is it different?",
      answer: "Vedic astrology (Jyotish) is an ancient Indian system over 5,000 years old that uses sidereal zodiac calculations based on actual star positions, unlike Western astrology which uses tropical zodiac. It provides detailed insights about your life, personality, career, relationships, and future based on precise planetary positions at your birth time and location."
    },
    {
      question: "How accurate is the AI astrologer?",
      answer: "Our AI is trained on thousands of classical Vedic astrology texts and modern interpretations. It uses advanced algorithms to analyze planetary positions, dashas, and transits with 100% mathematical accuracy. While the calculations are precise, astrological interpretation is an art - our AI provides insights based on traditional Vedic principles combined with modern context."
    },
    {
      question: "What if I don't know my exact birth time?",
      answer: "Birth time is crucial for accurate Vedic chart calculations as it determines your Ascendant (Lagna) and house positions. If you don't know your exact time, you can still create a chart using 12:00 PM, but predictions related to houses, Dasha periods, and timing will be less accurate. We recommend checking your birth certificate or hospital records for the most precise time."
    },
    {
      question: "Is my personal data secure and private?",
      answer: "Absolutely! All your personal information, birth details, and chat history are encrypted at rest using AES-256 encryption. We never share, sell, or disclose your data to third parties. Your conversations with the AI are completely private. We comply with international data protection standards and you can delete your data anytime from your account settings."
    },
    {
      question: "What are the limitations of the free plan?",
      answer: "The free plan includes limited birth charts and messages per day with an hourly limit. This is perfect for trying out the service and getting basic insights. If you need more charts for family/friends or deeper analysis through extended conversations, you can upgrade to Weekly or Monthly plans with higher limits. Check our Pricing page for current plan details."
    },
    {
      question: "Can I cancel or change my subscription anytime?",
      answer: "Yes! You can cancel your subscription anytime from your dashboard with no questions asked and no cancellation fees. When you cancel, you'll continue to have premium access until the end of your current billing period. You can also upgrade from Weekly to Monthly or downgrade - changes take effect at the next billing cycle."
    },
    {
      question: "Are payments secure? What payment methods do you accept?",
      answer: "All payments are processed through Razorpay, a PCI DSS compliant payment gateway trusted by millions. We never store your card details on our servers. Razorpay accepts credit/debit cards, UPI, net banking, and digital wallets. All transactions are encrypted with industry-standard SSL/TLS protocols."
    },
    {
      question: "What information does my birth chart include?",
      answer: "Your Vedic birth chart (Kundali) includes: planetary positions in signs and houses, Ascendant (Lagna), Moon sign (Rashi), Nakshatra, planetary aspects, Dasha periods, divisional charts (D9, D10, etc.), yogas and doshas, and more. Our AI can explain any aspect of your chart and answer specific questions about career, relationships, health, finances, and timing of events."
    },
    {
      question: "Can I create charts for my family and friends?",
      answer: "Yes! You can create multiple birth charts within your account limit. Free users get 2 charts, while premium subscribers get up to 50 charts. This allows you to analyze compatibility (Kundali matching), compare family members' charts, or keep charts for friends. Each chart is saved in your dashboard for easy access and future reference."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 7-day money-back guarantee for first-time subscribers. If you're not satisfied with the service within the first 7 days of your subscription, contact our support team for a full refund. After 7 days, subscriptions are non-refundable, but you can cancel anytime to prevent future charges."
    },
    {
      question: "What if I encounter technical issues or have questions?",
      answer: "Our support team is here to help! You can reach us through the Contact page or email us directly. Premium subscribers get priority support with faster response times (usually within 24 hours). We're continuously improving the platform and value your feedback."
    },
    {
      question: "How does the AI chat work?",
      answer: "Our AI astrologer analyzes your birth chart and uses natural language processing to understand your questions. It can discuss any aspect of your chart, explain astrological concepts, provide predictions, and offer guidance. The AI remembers context from your conversation, so you can have in-depth discussions just like with a human astrologer."
    },
    {
      question: "Can I get predictions for specific dates or events?",
      answer: "Yes! The AI can analyze transits and Dasha periods to provide timing predictions for career changes, relationships, travel, health, and other life events. You can ask about specific dates or time periods, and the AI will analyze planetary positions and their effects on your chart."
    },
    {
      question: "What is Kundali matching and how does it work?",
      answer: "Kundali matching (Guna Milan) is the traditional Vedic method for assessing compatibility between two people, especially for marriage. It compares birth charts across 8 categories (Ashtakoota) and assigns points based on planetary harmony. You can create charts for both individuals and ask the AI to analyze compatibility, strengths, and potential challenges in the relationship."
    },
    {
      question: "Do you offer compatibility analysis for relationships?",
      answer: "Yes! Create birth charts for both partners and ask the AI about compatibility. The AI analyzes planetary positions, house overlays, aspects between charts, and Vedic compatibility factors. It can provide insights about emotional compatibility, communication styles, long-term potential, and areas that need attention."
    }
  ];

  return (
    <>
      <PageSEO page="faq" />
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
              <Button asChild className="cosmic-glow">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about AstroLord
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:cosmic-glow transition-all"
                >
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div className="mt-12 p-8 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 backdrop-blur-sm border border-accent/30 text-center">
              <h3 className="text-2xl font-bold mb-4">Want to Learn More?</h3>
              <p className="text-muted-foreground mb-6">
                Explore our comprehensive learning center or contact support for help
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/learn">
                  <Button className="cosmic-glow">
                    Learn Vedic Astrology
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="border-border/50">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default FAQ;
