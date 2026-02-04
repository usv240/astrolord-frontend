import { useEffect, useState } from 'react';
import { chartAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Eye, X, Globe, Navigation, MessageSquare, Sparkles, Trash2, Star, AlertTriangle, Copy, Check, RotateCcw, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ChartBundle, getZodiacSign } from '@/types/chart';
import { DailyCosmicChat } from './DailyCosmicChat';
import DailyTransits from './DailyTransits'; // Keep for now if needed, or remove
import { PDFReportCard } from './PDFReportCard';
import { ChartSearch } from './ChartSearch';
import { FavoritesManager, useFavorites } from './FavoritesManager';
import { EmptyStates } from './EmptyStates';
import { Skeleton } from '@/components/ui/skeleton';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useUndoDelete } from '@/hooks/useUndoDelete';
import { createLogger } from '@/utils/logger';
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

const log = createLogger('ChartList');

interface Chart {
  chart_id: string;
  name?: string;
  dob: string;
  time: string;
  city?: string;
  lat?: number;
  lon?: number;
  created_at: string;
}

const ChartList = ({
  onSelectChart,
  activeChartId,
  initialViewMode,
  onViewModeChange,
  onViewChart,
  onCloseChart,
  onCreateNew,
  refreshTrigger,
}: {
  onSelectChart?: (chartId: string, mode?: 'analysis' | 'daily') => void;
  activeChartId?: string;
  initialViewMode?: string;
  onViewModeChange?: (mode: string | null) => void;
  onViewChart?: (chartId: string) => void;
  onCloseChart?: () => void;
  onCreateNew?: () => void;
  refreshTrigger?: number;
}) => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<ChartBundle | null>(null);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);
  const [showPDFReport, setShowPDFReport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; chartId: string | null; chartName: string }>({
    open: false,
    chartId: null,
    chartName: '',
  });

  // Favorites management
  const { favorites, toggleFavorite, isFavorite, isAnimating } = useFavorites();

  // Copy to clipboard for chart IDs
  const { copy, isCopied } = useCopyToClipboard({
    successMessage: 'Chart ID copied!',
  });

  // Undo delete functionality
  const { initiateDelete: initiateUndoDelete } = useUndoDelete<Chart>({
    onDelete: async (chart) => {
      await chartAPI.deleteChart(chart.chart_id);
      if (selectedChart?.chart_id === chart.chart_id) {
        setSelectedChart(null);
      }
    },
    onUndo: async (chart) => {
      // Re-fetch charts to restore the list
      await loadCharts();
    },
    itemType: 'chart',
    getItemName: (chart) => chart.name || 'Unnamed Chart',
  });

  useEffect(() => {
    loadCharts();
  }, [refreshTrigger]);

  useEffect(() => {
    if (activeChartId) {
      if (!selectedChart || selectedChart.chart_id !== activeChartId) {
        // If we have an active ID but no chart (or wrong chart), load it
        // We call the internal fetch logic directly here to avoid loop
        fetchChartDetails(activeChartId);
      }
    } else {
      // If URL cleared, close chart
      setSelectedChart(null);
    }
  }, [activeChartId]);

  const loadCharts = async () => {
    try {
      const response = await chartAPI.getMyCharts();
      setCharts(response.data.charts || []);
    } catch (error: any) {
      toast.error('Failed to load charts');
      log.error('Failed to load charts', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartDetails = async (chartId: string) => {
    setIsLoadingBundle(true);
    try {
      const response = await chartAPI.getChartBundle(chartId);
      setSelectedChart(response.data);
      setShowPDFReport(false);
    } catch (error: any) {
      toast.error('Failed to load chart details');
      log.error('Failed to load chart details', { error: error.message });
    } finally {
      setIsLoadingBundle(false);
    }
  };

  const openDeleteConfirm = (chartId: string, chartName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setDeleteConfirm({ open: true, chartId, chartName });
  };

  const handleDeleteChart = async () => {
    if (!deleteConfirm.chartId) return;

    const chartId = deleteConfirm.chartId;
    const chartToDelete = charts.find(c => c.chart_id === chartId);
    setDeleteConfirm({ open: false, chartId: null, chartName: '' });

    if (!chartToDelete) return;

    // Use undo delete for better UX
    initiateUndoDelete(
      chartToDelete,
      chartId,
      // Optimistic delete
      () => setCharts(prev => prev.filter(c => c.chart_id !== chartId)),
      // Restore on undo
      () => setCharts(prev => [...prev, chartToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
    );
  };

  const viewChart = (chartId: string) => {
    if (onViewChart) {
      onViewChart(chartId);
    } else {
      fetchChartDetails(chartId);
    }
  };

  // Single handler for chat - opens mode selector
  const handleChatClick = () => {
    if (selectedChart && onSelectChart) {
      // Pass chart ID - the mode selector will handle mode selection
      onSelectChart(selectedChart.chart_id);
    }
  };

  const closeChartDetails = () => {
    if (onCloseChart) {
      onCloseChart();
    }
    setSelectedChart(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your charts...</p>
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <EmptyStates
        type="no-charts"
        onPrimaryAction={() => {
          // Trigger create tab
          if (onCreateNew) {
            onCreateNew();
          } else if (onViewChart) {
            onViewChart('');
          }
        }}
        onSecondaryAction={() => {
          // Could link to learn section
          toast.info('Learn section coming soon!');
        }}
      />
    );
  }

  // If no results after filtering
  if (filteredCharts.length === 0 && charts.length > 0) {
    return (
      <div className="space-y-6">
        <ChartSearch
          charts={charts}
          onFilteredChange={setFilteredCharts}
        />
        <EmptyStates
          type="no-results"
          onPrimaryAction={() => {
            setFilteredCharts(charts);
          }}
          onSecondaryAction={() => {
            // Trigger create tab
            if (onViewChart) {
              onViewChart('');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter & Refresh */}
      <div className="flex gap-2">
        <ChartSearch
          charts={charts}
          onFilteredChange={setFilteredCharts}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => loadCharts()}
          className="shrink-0 border-border/50 hover:bg-muted"
          title="Refresh Charts"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Favorites Section */}
      {!selectedChart && (
        <FavoritesManager
          charts={charts}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectChart={(chartId) => {
            viewChart(chartId);
          }}
        />
      )}

      {/* Main Content */}
      {!selectedChart ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharts.map((chart) => (
            <Card
              key={chart.chart_id}
              className="group relative overflow-hidden border-border/50 backdrop-blur-sm bg-card/60 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:bg-card/80 hover:-translate-y-1 cursor-pointer"
              onClick={() => viewChart(chart.chart_id)}
            >
              {/* Star Button - Absolute Position */}
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(chart.chart_id);
                  }}
                  className={`p-2 rounded-full transition-all duration-300 ${isFavorite(chart.chart_id)
                    ? 'opacity-100 bg-yellow-500/10'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-secondary/20'
                    }`}
                  title={isFavorite(chart.chart_id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    className={`h-4 w-4 transition-colors ${isFavorite(chart.chart_id)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-muted-foreground hover:text-yellow-500'
                      } ${isAnimating(chart.chart_id) ? 'animate-star-pop' : ''}`}
                  />
                </button>
              </div>

              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/10 shadow-sm group-hover:shadow-primary/20 transition-all">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 group-hover:from-primary group-hover:to-purple-400 transition-all duration-300">
                      {chart.name || 'Unnamed Chart'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Vedic Astrology Chart</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground/80">
                  <div className="flex items-center gap-2 bg-secondary/10 p-2 rounded-md hover:bg-secondary/20 transition-colors">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    <span className="truncate">{chart.dob}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/10 p-2 rounded-md hover:bg-secondary/20 transition-colors">
                    <Clock className="h-3.5 w-3.5 text-green-400" />
                    <span className="truncate">{chart.time}</span>
                  </div>
                  {chart.city && (
                    <div className="col-span-2 flex items-center gap-2 bg-secondary/10 p-2 rounded-md hover:bg-secondary/20 transition-colors">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span className="truncate">{chart.city}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewChart(chart.chart_id);
                    }}
                    variant="outline"
                    className="flex-1 bg-primary/5 hover:bg-primary/15 text-primary border-primary/20 hover:border-primary/50 transition-all"
                    disabled={isLoadingBundle}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isLoadingBundle ? 'Loading...' : 'View Details'}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(chart.chart_id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Copy Chart ID"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={(e) => openDeleteConfirm(chart.chart_id, chart.name || 'Unnamed Chart', e)}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isLoadingBundle ? (
        /* Chart Bundle Loading Skeleton */
        <Card className="border-border/50 backdrop-blur-sm bg-card/80 overflow-hidden shadow-xl animate-in fade-in duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : (
        /* Enhanced Chart Detail View */
        <Card className="border-border/50 backdrop-blur-sm bg-card/80 overflow-hidden shadow-xl">
          {/* Compact Header Section */}
          <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent py-3 sm:py-4">
            {/* Single Row: Back + Chart Info + Actions */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChartDetails}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {/* Cosmic Icon - Smaller */}
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/10">
                <span className="text-lg">🪐</span>
              </div>

              {/* Chart Name & Meta - Inline */}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary truncate">
                  {selectedChart.base?.request_subject?.name || 'Unknown Chart'}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1 mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                  <span>{selectedChart.base?.request_subject?.dob || 'N/A'}</span>
                  <span className="text-border">•</span>
                  <span>{selectedChart.base?.request_subject?.time || 'N/A'}</span>
                  {selectedChart.base?.request_subject?.location?.city && (
                    <>
                      <span className="text-border">•</span>
                      <span className="truncate max-w-[80px]">{selectedChart.base.request_subject.location.city}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => toggleFavorite(selectedChart.chart_id)}
                  title={isFavorite(selectedChart.chart_id) ? 'Remove from favorites' : 'Add to favorites'}
                  className="p-1.5 rounded-full hover:bg-yellow-500/10 transition-colors"
                >
                  <Star
                    className={`h-4 w-4 ${isFavorite(selectedChart.chart_id)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-muted-foreground hover:text-yellow-500'
                      }`}
                  />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => openDeleteConfirm(selectedChart.chart_id, selectedChart.base?.request_subject?.name || 'This chart', e)}
                  className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete chart"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {/* Zodiac Signs Row */}
            {selectedChart.base?.charts?.planets && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-border/30">
                {/* Sun Sign */}
                {(() => {
                  const planets = selectedChart.base.charts.planets;
                  // Handle both array and object formats
                  const planetsArray = Array.isArray(planets) ? planets : Object.values(planets);
                  const sun = planetsArray.find((p: any) => p.name === 'Sun') as { name: string; current_sign: number } | undefined;
                  if (!sun) return null;
                  return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                      <span className="text-amber-400">☉</span>
                      <span className="text-xs sm:text-sm font-medium text-amber-300">{getZodiacSign(sun.current_sign)}</span>
                    </div>
                  );
                })()}

                {/* Moon Sign */}
                {(() => {
                  const planets = selectedChart.base.charts.planets;
                  const planetsArray = Array.isArray(planets) ? planets : Object.values(planets);
                  const moon = planetsArray.find((p: any) => p.name === 'Moon') as { name: string; current_sign: number } | undefined;
                  if (!moon) return null;
                  return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-400/10 border border-slate-400/30">
                      <span className="text-slate-300">☽</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-300">{getZodiacSign(moon.current_sign)}</span>
                    </div>
                  );
                })()}

                {/* Ascendant (first planet in list or Lagna) */}
                {(() => {
                  const planets = selectedChart.base.charts.planets;
                  const planetsArray = Array.isArray(planets) ? planets : Object.values(planets);
                  const asc = planetsArray.find((p: any) => p.name === 'Ascendant' || p.name === 'Lagna') as { name: string; current_sign: number } | undefined;
                  if (!asc) return null;
                  return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
                      <span className="text-purple-400">↑</span>
                      <span className="text-xs sm:text-sm font-medium text-purple-300">{getZodiacSign(asc.current_sign)}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-4 sm:pt-6">
            {/* Guidance Tips */}
            <div className="mb-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent border border-primary/10">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">What you can do:</p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">1.</span>
                      <span><strong className="text-foreground">Chat with AI</strong> — Ask about your day, relationships, career, or get personalized predictions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">2.</span>
                      <span><strong className="text-foreground">Explore your chart</strong> — Learn about your planets, houses, and dashas in depth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">3.</span>
                      <span><strong className="text-foreground">Get PDF report</strong> — Download a comprehensive 20+ page Vedic astrology analysis</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Primary Action - Centered Chat Button with constrained width */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Button
                  onClick={handleChatClick}
                  className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-md cosmic-glow h-11 sm:h-12 text-sm sm:text-base shadow-lg shadow-primary/20 px-6 sm:px-8"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Chat with AI Astrologer
                </Button>
                {/* Pulsing indicator */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                </span>
              </div>
              <p className="text-center text-[11px] sm:text-xs text-muted-foreground mt-2">
                👆 Click here to start your personalized cosmic conversation
              </p>
            </div>

            {/* Compact PDF Report Section - Just a link/button style */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 rounded-lg bg-gradient-to-r from-accent/5 to-orange-500/5 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-accent/20 to-orange-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-sm">Complete PDF Report</h4>
                  <p className="text-[11px] text-muted-foreground">20+ pages • $1.50</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPDFReport(!showPDFReport)}
                className="border-accent/30 hover:border-accent hover:bg-accent/10 text-xs"
              >
                {showPDFReport ? 'Hide Details' : 'View Details'}
              </Button>
            </div>

            {/* Expanded PDF Details */}
            {showPDFReport && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                <PDFReportCard
                  chartId={selectedChart.chart_id}
                  chartName={selectedChart.base?.request_subject?.name || 'Your Chart'}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )
      }

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, chartId: null, chartName: '' })}>
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Chart
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteConfirm.chartName}"</span>?
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default ChartList;
