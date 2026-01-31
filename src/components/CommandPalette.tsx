import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Home,
  Plus,
  MessageSquare,
  Heart,
  Settings,
  HelpCircle,
  CreditCard,
  LogOut,
  Search,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  BarChart3,
  Book,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { chartAPI } from '@/lib/api';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const log = createLogger('CommandPalette');

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  group: 'navigation' | 'actions' | 'charts' | 'theme' | 'help';
}

/**
 * CommandPalette - Global search and command palette (Cmd+K)
 * 
 * Features:
 * - Keyboard shortcut (Cmd+K or Ctrl+K)
 * - Quick navigation to any page
 * - Search through charts
 * - Quick actions (create chart, theme toggle)
 * - Fuzzy search
 */
export const CommandPalette = memo(() => {
  const [open, setOpen] = useState(false);
  const [charts, setCharts] = useState<Array<{ chart_id: string; name?: string; dob: string }>>([]);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load charts when opening (if logged in)
  useEffect(() => {
    if (open && user && charts.length === 0) {
      setIsLoadingCharts(true);
      chartAPI.getMyCharts()
        .then((res) => {
          setCharts(res.data.charts || []);
        })
        .catch((err) => log.error('Failed to load charts for command palette', { error: String(err) }))
        .finally(() => setIsLoadingCharts(false));
    }
  }, [open, user, charts.length]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems: CommandItem[] = useMemo(() => [
    {
      id: 'home',
      label: 'Go to Dashboard',
      icon: <Home className="h-4 w-4" />,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'dashboard', 'main'],
      shortcut: 'G H',
      group: 'navigation',
    },
    {
      id: 'charts',
      label: 'View My Charts',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate('/dashboard?tab=charts'),
      keywords: ['charts', 'birth', 'horoscope'],
      shortcut: 'G C',
      group: 'navigation',
    },
    {
      id: 'chat',
      label: 'Open AI Chat',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => navigate('/dashboard?tab=chat'),
      keywords: ['chat', 'ai', 'ask', 'question'],
      shortcut: 'G A',
      group: 'navigation',
    },
    {
      id: 'match',
      label: 'Relationship Matching',
      icon: <Heart className="h-4 w-4" />,
      action: () => navigate('/dashboard?tab=relationship'),
      keywords: ['match', 'relationship', 'compatibility', 'love'],
      shortcut: 'G M',
      group: 'navigation',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'account'],
      shortcut: 'G S',
      group: 'navigation',
    },
    {
      id: 'pricing',
      label: 'View Pricing',
      icon: <CreditCard className="h-4 w-4" />,
      action: () => navigate('/pricing'),
      keywords: ['pricing', 'plans', 'subscription', 'upgrade'],
      group: 'navigation',
    },
  ], [navigate]);

  const actionItems: CommandItem[] = useMemo(() => [
    {
      id: 'create-chart',
      label: 'Create New Chart',
      icon: <Plus className="h-4 w-4" />,
      action: () => navigate('/dashboard?tab=create'),
      keywords: ['create', 'new', 'chart', 'add'],
      shortcut: 'C',
      group: 'actions',
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4" />,
      action: () => {
        logout();
        navigate('/');
        toast.success('Signed out successfully');
      },
      keywords: ['logout', 'signout', 'exit'],
      group: 'actions',
    },
  ], [navigate, logout]);

  const themeItems: CommandItem[] = useMemo(() => [
    {
      id: 'theme-light',
      label: 'Light Mode',
      icon: <Sun className="h-4 w-4" />,
      action: () => {
        setTheme('light');
        toast.success('Switched to light mode');
      },
      keywords: ['light', 'theme', 'bright'],
      group: 'theme',
    },
    {
      id: 'theme-dark',
      label: 'Dark Mode',
      icon: <Moon className="h-4 w-4" />,
      action: () => {
        setTheme('dark');
        toast.success('Switched to dark mode');
      },
      keywords: ['dark', 'theme', 'night'],
      group: 'theme',
    },
    {
      id: 'theme-system',
      label: 'System Theme',
      icon: <Monitor className="h-4 w-4" />,
      action: () => {
        setTheme('system');
        toast.success('Using system theme');
      },
      keywords: ['system', 'theme', 'auto'],
      group: 'theme',
    },
  ], [setTheme]);

  const helpItems: CommandItem[] = useMemo(() => [
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => navigate('/faq'),
      keywords: ['faq', 'help', 'questions'],
      group: 'help',
    },
    {
      id: 'learn',
      label: 'Learn Astrology',
      icon: <Book className="h-4 w-4" />,
      action: () => navigate('/learn'),
      keywords: ['learn', 'education', 'tutorial'],
      group: 'help',
    },
    {
      id: 'contact',
      label: 'Contact Support',
      icon: <Mail className="h-4 w-4" />,
      action: () => navigate('/contact'),
      keywords: ['contact', 'support', 'help', 'email'],
      group: 'help',
    },
  ], [navigate]);

  return (
    <>
      {/* Keyboard hint (optional floating button) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex fixed bottom-6 right-6 items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-lg border border-border/50 rounded-lg shadow-lg hover:bg-card transition-colors z-40"
        title="Open command palette (Cmd+K)"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No results found.</p>
              </div>
            </CommandEmpty>

            {/* Charts */}
            {user && charts.length > 0 && (
              <CommandGroup heading="Your Charts">
                {charts.slice(0, 5).map((chart) => (
                  <CommandItem
                    key={chart.chart_id}
                    value={`chart ${chart.name || 'Unnamed'} ${chart.dob}`}
                    onSelect={() => runCommand(() => navigate(`/dashboard?tab=charts&chartId=${chart.chart_id}`))}
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    <span>{chart.name || 'Unnamed Chart'}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{chart.dob}</span>
                  </CommandItem>
                ))}
                {charts.length > 5 && (
                  <CommandItem
                    value="view all charts"
                    onSelect={() => runCommand(() => navigate('/dashboard?tab=charts'))}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>View all {charts.length} charts...</span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}

            {/* Quick Actions */}
            {user && (
              <CommandGroup heading="Quick Actions">
                {actionItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                    onSelect={() => runCommand(item.action)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                    {item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            {/* Navigation */}
            <CommandGroup heading="Navigation">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => runCommand(item.action)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Theme */}
            <CommandGroup heading="Theme">
              {themeItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => runCommand(item.action)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                  {theme === item.id.replace('theme-', '') && (
                    <span className="ml-2 text-xs text-primary">(current)</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Help */}
            <CommandGroup heading="Help">
              {helpItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => runCommand(item.action)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
});

CommandPalette.displayName = 'CommandPalette';

export default CommandPalette;

