import { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Sparkles, MessageSquare, Settings, Heart, Users, Trash2, HelpCircle, User, ChevronDown, Mail, Shield, Menu, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ChartCreator from '@/components/ChartCreator';
import ChartList from '@/components/ChartList';
import AIChat from '@/components/AIChat';
import RelationshipMatch from '@/components/RelationshipMatch';
import OnboardingManager, { showTutorialDirectly } from '@/components/OnboardingManager';
import { relationshipAPI } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubscriptionWidget } from '@/components/SubscriptionWidget';
import { QuotaWidget } from '@/components/QuotaWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardNav } from '@/components/DashboardNav';
import { DashboardHome } from '@/components/DashboardHome';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ChatChartSelector } from '@/components/ChatChartSelector';
import { useQuota } from '@/hooks/useQuota';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const log = createLogger('Dashboard');

// Valid tabs - includes all navigable tabs
const VALID_TABS = ['home', 'charts', 'create', 'chat', 'relationship'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refresh: refreshQuota } = useQuota();

  // Initialize state from URL params - redirect old tabs to home
  const tabParam = searchParams.get('tab') || 'home';
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'home';
  const selectedChartId = searchParams.get('chartId') || undefined;
  const viewMode = searchParams.get('mode') || undefined;

  // Relationship State
  const selectedMatchId = searchParams.get('matchId');
  const [isCreating, setIsCreating] = useState(false);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteMatchConfirm, setDeleteMatchConfirm] = useState<{ open: boolean; matchId: string | null; matchName: string }>({
    open: false,
    matchId: null,
    matchName: '',
  });
  const [chartListRefreshKey, setChartListRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Load Recent Matches when tab is active
  useEffect(() => {
    if (activeTab === 'relationship' && user) {
      relationshipAPI.listMatches()
        .then(res => setRecentMatches(res.data))
        .catch(err => log.error('Failed to load matches', { error: String(err) }));
    }
  }, [activeTab, user]);

  const openDeleteMatchConfirm = useCallback((matchId: string, matchName: string) => {
    setDeleteMatchConfirm({ open: true, matchId, matchName });
  }, []);

  const handleDeleteMatch = useCallback(async () => {
    if (!deleteMatchConfirm.matchId) return;

    const matchId = deleteMatchConfirm.matchId;
    setDeleteMatchConfirm({ open: false, matchId: null, matchName: '' });

    try {
      await relationshipAPI.deleteMatch(matchId);
      setRecentMatches(prev => prev.filter(m => m.match_id !== matchId));
      if (selectedMatchId === matchId) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('matchId');
        setSearchParams(newParams);
      }
    } catch (error) {
      log.error('Failed to delete match', { error: String(error) });
    }
  }, [selectedMatchId, searchParams, setSearchParams]);

  const handleTabChange = useCallback((value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', value);
    // Clear mode when changing tabs
    newParams.delete('mode');
    // When switching to chat tab, clear chartId so user sees chart selector first
    if (value === 'chat') {
      newParams.delete('chartId');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleChartSelect = useCallback((chartId: string, mode?: 'analysis' | 'daily') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'chat');
    newParams.set('chartId', chartId);
    if (mode) {
      newParams.set('mode', mode);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Onboarding Flow */}
      <OnboardingManager />

      <div className={`overflow-x-hidden bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark ${activeTab === 'chat' && selectedChartId ? 'h-screen flex flex-col' : 'min-h-screen'
        }`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        <header className="border-b border-border/50 backdrop-blur-sm bg-card/30 relative z-10 shrink-0">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Sidebar */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw] sm:w-[300px] p-0 pt-6">
                  <SheetHeader className="px-6 mb-4 text-left">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 h-full">
                    <DashboardNav
                      activeTab={activeTab}
                      onTabChange={(tab: string) => {
                        handleTabChange(tab);
                        setIsMobileMenuOpen(false);
                      }}
                      onLogout={logout}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="/logo.png"
                  alt="AstroLord"
                  className="h-8 sm:h-10 w-auto"
                />
              </Link>
              {/* Hide welcome message on small screens */}
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">
                  Welcome, {user.name || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />

              {user.is_admin && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="border-border/50 px-2 sm:px-3"
                  size="sm"
                >
                  <Shield className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border/50 gap-1 sm:gap-2 px-2 sm:px-3"
                    size="sm"
                  >
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      showTutorialDirectly();
                      toast.success('Tutorial is now open!');
                    }}
                    className="cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Tutorial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>


        <main className={`relative z-10 ${activeTab === 'chat' && selectedChartId ? 'flex-1 min-h-0' : ''}`}>
          <div className={`grid grid-cols-1 lg:grid-cols-[250px_1fr] ${activeTab === 'chat' && selectedChartId ? 'h-full' : ''}`}>
            {/* Left Sidebar - Navigation */}
            <aside className="hidden lg:block p-4 pt-8">
              <DashboardNav
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-200 ${activeTab === 'chat' && selectedChartId
              ? 'h-full p-0 overflow-hidden'
              : 'space-y-6 px-4 lg:px-8 py-8 pb-24 lg:pb-8 max-w-6xl'
              }`}>
              {/* Home Tab - New Overview Page */}
              {activeTab === 'home' && (
                <DashboardHome
                  onNavigate={handleTabChange}
                  userName={user?.name}
                />
              )}

              {/* Charts Tab */}
              {activeTab === 'charts' && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold">My Charts</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">View, manage, and search all your birth charts</p>
                  </div>
                  <ChartList
                    key={chartListRefreshKey}
                    refreshTrigger={chartListRefreshKey}
                    onSelectChart={handleChartSelect}
                    activeChartId={selectedChartId}
                    initialViewMode={viewMode}
                    onViewChart={(chartId) => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('chartId', chartId);
                      setSearchParams(newParams);
                    }}
                    onCloseChart={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('chartId');
                      newParams.delete('mode');
                      setSearchParams(newParams);
                    }}
                    onViewModeChange={(mode) => {
                      const newParams = new URLSearchParams(searchParams);
                      if (mode) {
                        newParams.set('mode', mode);
                      } else {
                        newParams.delete('mode');
                      }
                      setSearchParams(newParams);
                    }}
                    onCreateNew={() => handleTabChange('create')}
                  />
                </div>
              )}

              {/* Create Chart Tab */}
              {activeTab === 'create' && (
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div>
                    <h1 className="text-lg sm:text-xl md:text-3xl font-bold">Create New Chart</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Generate your birth chart with precise calculations</p>
                  </div>
                  <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                    <CardHeader className="py-3 px-4 sm:py-4 sm:px-6 md:py-6">
                      <CardTitle className="text-base sm:text-lg md:text-xl">Enter Your Birth Details</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Your accurate birth information helps us calculate your personalized chart
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                      <ChartCreator
                        onSuccess={() => {
                          // Increment refresh key to reload chart list
                          setChartListRefreshKey(prev => prev + 1);
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('tab', 'charts');
                          newParams.delete('chartId');
                          newParams.delete('mode');
                          setSearchParams(newParams);
                        }}
                        onChartCreated={refreshQuota}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className={selectedChartId ? "h-full" : "space-y-2"}>
                  {!selectedChartId && (
                    <div className="mb-0">
                      <h1 className="text-xl sm:text-2xl font-bold">Chat with AI Astrologer</h1>
                      <p className="text-xs sm:text-sm text-muted-foreground">Ask anything about your chart and get instant insights</p>
                    </div>
                  )}
                  {selectedChartId ? (
                    <AIChat
                      chartId={selectedChartId}
                      mode={viewMode === 'daily' ? 'daily' : 'analysis'}
                      onSwitchChart={handleChartSelect}
                      onBack={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('tab', 'charts');
                        // Don't delete chartId, so we go back to the specific chart detail view
                        newParams.delete('mode'); // Clear mode to return to standard view
                        setSearchParams(newParams);
                      }}
                    />
                  ) : (
                    <ChatChartSelector
                      onSelectChart={handleChartSelect}
                      onCreateChart={() => handleTabChange('create')}
                    />
                  )}
                </div>
              )}

              {/* Relationship Tab */}
              {activeTab === 'relationship' && (
                <div className="space-y-2">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold">Relationship Match</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Check compatibility and connection dynamics with others</p>
                  </div>
                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Sidebar List */}
                    <div className="lg:col-span-1 space-y-4 order-2 lg:order-1 mt-8 lg:mt-0">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader className="py-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Recent
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-1 p-2">
                              <Button
                                variant={selectedMatchId === null && isCreating ? "secondary" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => {
                                  const newParams = new URLSearchParams(searchParams);
                                  newParams.delete('matchId');
                                  setSearchParams(newParams);
                                  setIsCreating(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                New Match
                              </Button>
                              {recentMatches.map((m) => (
                                <div key={m.match_id} className="group relative w-full">
                                  <Button
                                    variant={selectedMatchId === m.match_id ? "secondary" : "ghost"}
                                    className="w-full justify-start text-xs h-auto py-3 flex flex-col items-start gap-1 pr-8"
                                    onClick={() => {
                                      const newParams = new URLSearchParams(searchParams);
                                      newParams.set('matchId', m.match_id);
                                      setSearchParams(newParams);
                                      setIsCreating(false);
                                    }}
                                  >
                                    <div className="font-medium w-full truncate">
                                      {m.p1_name} & {m.p2_name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground flex justify-between w-full">
                                      <span>Score: {m.score}</span>
                                      <span>{new Date(m.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteMatchConfirm(m.match_id, `${m.p1_name} & ${m.p2_name}`);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                      <div className="text-center mb-3 sm:mb-4">
                        <h2 className="text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary backdrop-blur-sm inline-block">Find Your Match</h2>
                        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 text-muted-foreground flex-wrap">
                          <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-primary/20">Vedic Matchmaking</span>
                          <span className="text-xs">+</span>
                          <span className="bg-secondary/10 text-secondary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-secondary/20">AI Analysis</span>
                          <span className="text-xs">+</span>
                          <span className="bg-purple-500/10 text-purple-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-purple-500/20">Ask Anything</span>
                        </div>
                      </div>
                      {!selectedMatchId && !isCreating ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[500px] border border-dashed border-primary/20 rounded-xl bg-card/20 p-4 sm:p-8 text-center animate-in fade-in zoom-in duration-300">
                          <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 sm:mb-6 animate-pulse-glow shadow-lg shadow-primary/10">
                            <Heart className="w-7 h-7 sm:w-12 sm:h-12 text-primary fill-primary/20" />
                          </div>
                          <h2 className="text-xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary mb-2 sm:mb-4">Find Your Cosmic Connection</h2>
                          <p className="text-muted-foreground max-w-lg mb-4 sm:mb-8 text-sm sm:text-lg leading-relaxed">
                            Discover relationship dynamics using Vedic wisdom combined with AI analysis.
                          </p>
                          <Button
                            size="default"
                            onClick={() => setIsCreating(true)}
                            className="cosmic-glow text-sm sm:text-lg px-6 sm:px-10 py-4 sm:py-8 h-auto rounded-full transition-all hover:scale-105 shadow-xl shadow-primary/20"
                          >
                            <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-6 sm:w-6" />
                            Create New Match
                          </Button>
                        </div>
                      ) : (
                        <RelationshipMatch
                          matchId={selectedMatchId}
                          onNewMatch={() => {
                            // Refresh list if needed
                            relationshipAPI.listMatches().then(res => setRecentMatches(res.data));
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {(!selectedChartId || activeTab !== 'chat') && (
          <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </div>

      {/* Delete Match Confirmation Dialog */}
      <AlertDialog open={deleteMatchConfirm.open} onOpenChange={(open) => !open && setDeleteMatchConfirm({ open: false, matchId: null, matchName: '' })}>
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Match
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the match <span className="font-semibold text-foreground">"{deleteMatchConfirm.matchName}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMatch}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default memo(Dashboard);
