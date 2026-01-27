import { Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { Sparkles } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  const nav = [
    { label: 'Learn', href: '/learn' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 cosmic-glow">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AstroLord
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex h-8 items-center rounded-md border border-border/60 px-3 text-xs font-medium text-foreground hover:bg-muted/40"
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
