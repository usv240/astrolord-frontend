import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Eye,
  Heart,
  Shield,
  Zap,
  Users,
  Award,
  BookOpen,
  Brain,
  Globe,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const About = () => {
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
              <Button asChild className="cosmic-glow">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text">
                About AstroLord
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Where ancient Vedic wisdom meets cutting-edge AI technology to unlock the mysteries
                of your cosmic blueprint.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Mission */}
              <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To democratize access to authentic Vedic astrology by combining traditional wisdom
                  with modern AI technology, making personalized cosmic guidance available to
                  everyone, everywhere.
                </p>
              </div>

              {/* Vision */}
              <div className="p-8 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 backdrop-blur-sm border border-accent/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-accent/20">
                    <Eye className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To become the world's most trusted and accurate Vedic astrology platform,
                  empowering millions to make informed life decisions guided by the stars while
                  preserving the sanctity of ancient astrological traditions.
                </p>
              </div>
            </div>

            {/* Story Section */}
            <div className="mb-16 p-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  AstroLord was born from a simple realization: while Vedic astrology has guided
                  humanity for thousands of years, accessing authentic, personalized readings
                  remained expensive, time-consuming, and often inaccessible to many.
                </p>
                <p>
                  Traditional astrologers require hours to manually calculate charts and analyze
                  planetary positions. Consultations can cost hundreds of dollars and require
                  scheduling weeks in advance. For many seeking cosmic guidance, these barriers made
                  astrology a luxury rather than a tool for everyday life.
                </p>
                <p>
                  We asked ourselves:{' '}
                  <span className="text-primary font-semibold">
                    What if technology could preserve the depth and accuracy of Vedic astrology
                    while making it instantly accessible?
                  </span>
                </p>
                <p>
                  The answer is AstroLord. By training advanced AI on authentic Vedic astrological
                  principles and combining it with precise astronomical calculations, we've created
                  a platform that delivers expert-level insights in seconds, not hours. Our AI
                  doesn't replace human wisdom—it amplifies it, making ancient knowledge accessible
                  to the modern world.
                </p>
              </div>
            </div>

            {/* Why We're Different */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-8 text-center">Why AstroLord is Different</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Authentic Vedic Principles */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">100% Authentic Vedic</h3>
                  <p className="text-muted-foreground">
                    We use traditional Vedic calculations, not Western astrology. Our algorithms are
                    based on classical texts like Brihat Parashara Hora Shastra, ensuring authentic
                    interpretations.
                  </p>
                </div>

                {/* 2. AI-Powered Intelligence */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-secondary/50 transition-all">
                  <div className="p-3 rounded-full bg-secondary/10 w-fit mb-4">
                    <Brain className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Specialized AI Model</h3>
                  <p className="text-muted-foreground">
                    Unlike generic AI chatbots, our AI is purpose-built and trained specifically on
                    authentic Vedic astrological texts and principles. This specialized training
                    ensures accurate, reliable interpretations that honor traditional wisdom.
                  </p>
                </div>

                {/* 3. Instant & Available 24/7 */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-accent/50 transition-all">
                  <div className="p-3 rounded-full bg-accent/10 w-fit mb-4">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Instant Answers</h3>
                  <p className="text-muted-foreground">
                    No waiting for appointments. Ask questions and receive detailed astrological
                    guidance instantly, 24/7, from anywhere in the world.
                  </p>
                </div>

                {/* 4. Affordable Pricing */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-green-500/50 transition-all">
                  <div className="p-3 rounded-full bg-green-500/10 w-fit mb-4">
                    <Globe className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Affordable Access</h3>
                  <p className="text-muted-foreground">
                    Quality Vedic astrology guidance at prices that make sense. We believe cosmic
                    wisdom should be accessible to everyone, not just the privileged few.
                  </p>
                </div>

                {/* 5. Privacy & Security */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-blue-500/50 transition-all">
                  <div className="p-3 rounded-full bg-blue-500/10 w-fit mb-4">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Your Data is Sacred</h3>
                  <p className="text-muted-foreground">
                    Military-grade AES-256 encryption protects your birth data. We never share your
                    information with third parties. Your cosmic journey is yours alone.
                  </p>
                </div>

                {/* 6. Comprehensive Features */}
                <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-purple-500/50 transition-all">
                  <div className="p-3 rounded-full bg-purple-500/10 w-fit mb-4">
                    <Award className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Complete Analysis</h3>
                  <p className="text-muted-foreground">
                    Birth charts, Dasha predictions, compatibility analysis, daily forecasts, 40+
                    yogas & doshas detection— everything in one platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-8 text-center">Our Core Values</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Authenticity */}
                <div className="p-8 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm border border-border/50">
                  <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-2">
                    <Target className="h-6 w-6" /> Authenticity
                  </h3>
                  <p className="text-muted-foreground">
                    We honor the integrity of Vedic astrology traditions. Every prediction is rooted
                    in classical texts and authentic calculation methods, never simplified or
                    diluted for mass appeal.
                  </p>
                </div>

                {/* Accessibility */}
                <div className="p-8 rounded-lg bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm border border-border/50">
                  <h3 className="text-2xl font-bold mb-3 text-accent">🌍 Accessibility</h3>
                  <p className="text-muted-foreground">
                    Astrology shouldn't be a luxury. Through technology and smart pricing, we make
                    expert-level cosmic guidance available to everyone, anywhere in the world.
                  </p>
                </div>

                {/* Accuracy */}
                <div className="p-8 rounded-lg bg-gradient-to-br from-green-500/5 to-blue-500/5 backdrop-blur-sm border border-border/50">
                  <h3 className="text-2xl font-bold mb-3 text-green-500 flex items-center gap-2">
                    <Sparkles className="h-6 w-6" /> Accuracy
                  </h3>
                  <p className="text-muted-foreground">
                    Precision matters in astrology. We use NASA-level astronomical data and rigorous
                    calculation methods to ensure your chart is accurate to the second, giving you
                    reliable cosmic insights.
                  </p>
                </div>

                {/* Privacy */}
                <div className="p-8 rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-border/50">
                  <h3 className="text-2xl font-bold mb-3 text-blue-500 flex items-center gap-2">
                    <Lock className="h-6 w-6" /> Privacy
                  </h3>
                  <p className="text-muted-foreground">
                    Your birth data is deeply personal. We treat it with the utmost respect, using
                    enterprise-grade encryption and never sharing your information. Your trust is
                    our foundation.
                  </p>
                </div>
              </div>
            </div>

            {/* What Makes Us Unique - Comparison */}
            <div className="mb-16 p-10 rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm border border-primary/30">
              <h2 className="text-3xl font-bold mb-8 text-center">Traditional vs AstroLord</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Traditional Astrology */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-muted-foreground">
                    Traditional Consultations
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-red-500 mt-1">❌</span>
                      <span>Wait days or weeks for appointments</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-red-500 mt-1">❌</span>
                      <span>Expensive consultations, varies by astrologer</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-red-500 mt-1">❌</span>
                      <span>Limited to astrologer's availability</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-red-500 mt-1">❌</span>
                      <span>One-time reading, can't ask follow-ups</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-red-500 mt-1">❌</span>
                      <span>Variable quality based on astrologer's expertise</span>
                    </li>
                  </ul>
                </div>

                {/* AstroLord */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">With AstroLord</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="font-medium">Instant access, 24/7 availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="font-medium">Affordable subscription plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="font-medium">Available whenever you need guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="font-medium">Unlimited questions & follow-ups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="font-medium">
                        Consistent format and authentic Vedic accuracy
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Always Available</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="text-4xl font-bold text-secondary mb-2">40+</div>
                  <div className="text-sm text-muted-foreground">Yogas & Doshas</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="text-4xl font-bold text-accent mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Vedic Authentic</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="text-4xl font-bold text-green-500 mb-2">256-bit</div>
                  <div className="text-sm text-muted-foreground">AES Encryption</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Unlock Your Cosmic Blueprint?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands discovering their celestial path with authentic Vedic astrology
                powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="cosmic-glow">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Free Today
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button size="lg" variant="outline" className="border-border/50">
                    Learn More
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

export default About;
