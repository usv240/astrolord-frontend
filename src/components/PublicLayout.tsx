import { Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { Sparkles, Rocket } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  const nav = [
    { label: 'Learn', href: '/learn' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'Roadmap', href: '/roadmap', highlight: true },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 cosmic-glow">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-semibold text-xs sm:text-sm md:text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AstroLord
            </span>
          </Link>

          {/* Nav - Always visible, scales down for mobile */}
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 text-[10px] sm:text-xs md:text-sm overflow-x-auto">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap px-0.5 sm:px-1 ${isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  } ${item.highlight ? 'text-primary font-medium' : ''}`}
              >
                {item.highlight && <Rocket className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              to="/dashboard"
              className="inline-flex h-6 sm:h-7 md:h-8 items-center rounded-md border border-border/60 px-1.5 sm:px-2 md:px-3 text-[10px] sm:text-xs font-medium text-foreground hover:bg-muted/40"
            >
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 md:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
