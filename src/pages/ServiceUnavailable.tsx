import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const ServiceUnavailable = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10 cosmic-glow">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AstroLord
              </span>
            </Link>
            <ThemeToggle />
          </nav>
        </header>

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* 503 Visual */}
            <div className="mb-8">
              <AlertTriangle className="h-24 w-24 text-amber-500 mx-auto mb-4 animate-bounce" />
              <div className="text-7xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
                503
              </div>
            </div>

            {/* Message */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Service Temporarily Unavailable
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Our cosmic servers are receiving some celestial maintenance.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              We're working hard to get everything back online. This should only take a few moments.
            </p>

            {/* Status Info */}
            <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-8">
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Maintenance in Progress</p>
                    <p className="text-sm text-muted-foreground">We're performing essential updates and improvements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Expected Duration</p>
                    <p className="text-sm text-muted-foreground">Usually resolves within 30 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Stay Updated</p>
                    <p className="text-sm text-muted-foreground">
                      Follow our{' '}
                      <a
                        href="https://status.astrolord.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                        status page
                      </a>{' '}
                      for real-time updates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => window.location.reload()}
                size="lg"
                className="cosmic-glow"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
              <Link to="/">
                <Button size="lg" variant="outline" className="border-border/50 w-full">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Return Home
                </Button>
              </Link>
            </div>

            {/* What You Can Do */}
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-lg font-semibold mb-4">What You Can Do</h2>
              <ul className="space-y-3 text-left text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>Try refreshing the page in a few moments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>
                    Check our{' '}
                    <a
                      href="https://status.astrolord.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      status page
                    </a>{' '}
                    for updates
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>
                    Email us at{' '}
                    <a href="mailto:support@astro-lord.com" className="text-primary hover:underline font-semibold">
                      support@astro-lord.com
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>Follow us on social media for announcements</span>
                </li>
              </ul>
            </div>

            {/* Fun Message */}
            <div className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm text-muted-foreground">
                ✨ <strong className="text-foreground">Fun Fact:</strong> Even the planets need maintenance sometimes! 
                We'll be back online soon, more powerful than ever.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceUnavailable;
