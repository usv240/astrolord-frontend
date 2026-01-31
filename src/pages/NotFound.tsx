import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Search, BookOpen, MessageCircle, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createLogger } from "@/utils/logger";

const log = createLogger("NotFound");

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    log.warn("404 Error: User attempted to access non-existent route", { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10">
        {/* Header */}
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Visual */}
            <div className="mb-8">
              <div className="text-9xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
                404
              </div>
              <div className="flex justify-center gap-4 mb-4">
                <div className="text-4xl animate-bounce">🌙</div>
                <div className="text-4xl animate-pulse">⭐</div>
                <div className="text-4xl animate-bounce delay-100">✨</div>
              </div>
            </div>

            {/* Message */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lost in the Cosmos?
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              The page you're looking for has drifted into a different dimension.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Path attempted: <code className="px-2 py-1 rounded bg-card/50 text-primary">{location.pathname}</code>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/">
                <Button size="lg" className="cosmic-glow w-full sm:w-auto">
                  <Home className="h-5 w-5 mr-2" />
                  Return Home
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-border/50 w-full sm:w-auto">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <h2 className="text-xl font-semibold mb-6">Or explore these pages:</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/learn">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/50 transition-all group cursor-pointer">
                    <BookOpen className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold mb-1">Learn Astrology</div>
                    <div className="text-sm text-muted-foreground">Educational guides & tutorials</div>
                  </div>
                </Link>

                <Link to="/pricing">
                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 hover:border-secondary/50 transition-all group cursor-pointer">
                    <Sparkles className="h-6 w-6 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold mb-1">View Pricing</div>
                    <div className="text-sm text-muted-foreground">Plans & subscriptions</div>
                  </div>
                </Link>

                <Link to="/faq">
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/50 transition-all group cursor-pointer">
                    <MessageCircle className="h-6 w-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold mb-1">FAQ</div>
                    <div className="text-sm text-muted-foreground">Common questions answered</div>
                  </div>
                </Link>

                <Link to="/contact">
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 hover:border-green-500/50 transition-all group cursor-pointer">
                    <Search className="h-6 w-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold mb-1">Contact Us</div>
                    <div className="text-sm text-muted-foreground">Get help from support</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Helpful Message */}
            <div className="mt-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-muted-foreground">
                💡 <strong className="text-foreground">Tip:</strong> If you believe this page should exist, please{' '}
                <Link to="/contact" className="text-primary hover:underline font-semibold">
                  contact our support team
                </Link>{' '}
                and we'll look into it.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound;
