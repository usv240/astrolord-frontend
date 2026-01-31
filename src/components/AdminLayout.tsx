import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Ticket,
  Home,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createLogger } from '@/utils/logger';

const log = createLogger('AdminLayout');

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Check if user is admin
  const isAdmin = user?.is_admin || false;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have admin privileges to access this page.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: BarChart3,
      pattern: '^/admin$',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      pattern: '^/admin/users',
    },
    {
      name: 'Payments',
      href: '/admin/payments',
      icon: CreditCard,
      pattern: '^/admin/payments',
    },
    {
      name: 'Promo Codes',
      href: '/admin/promo',
      icon: Ticket,
      pattern: '^/admin/promo',
    },
    {
      name: 'Pricing',
      href: '/admin/pricing',
      icon: DollarSign,
      pattern: '^/admin/pricing',
    },
    {
      name: 'System Health',
      href: '/admin/system',
      icon: Activity,
      pattern: '^/admin/system',
    },
    {
      name: 'Moderation',
      href: '/admin/moderation',
      icon: AlertCircle,
      pattern: '^/admin/moderation',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      pattern: '^/settings',
    },
  ];

  const isActive = (pattern: string) => {
    return new RegExp(pattern).test(location.pathname);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      log.error('Logout failed', { error: String(error) });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-sidebar-background text-sidebar-foreground transition-all duration-300 overflow-hidden border-r border-sidebar-border`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <nav className="space-y-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.pattern);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border mt-6 pt-6 px-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent w-full transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted/60 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary/60 to-secondary/60 rounded-full" />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
