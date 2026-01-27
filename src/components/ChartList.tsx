import { useEffect, useState } from 'react';
import { chartAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Eye, X, Globe, Navigation, MessageSquare, Sparkles, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ChartBundle } from '@/types/chart';
import { DailyCosmicChat } from './DailyCosmicChat';
import DailyTransits from './DailyTransits'; // Keep for now if needed, or remove
import { PDFReportCard } from './PDFReportCard';
import { ChartSearch } from './ChartSearch';
import { FavoritesManager, useFavorites } from './FavoritesManager';
import { EmptyStates } from './EmptyStates';

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
  onCloseChart
}: {
  onSelectChart?: (chartId: string) => void;
  activeChartId?: string;
  initialViewMode?: string;
  onViewModeChange?: (mode: string | null) => void;
  onViewChart?: (chartId: string) => void;
  onCloseChart?: () => void;
}) => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<ChartBundle | null>(null);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);
  const [showDailyForecast, setShowDailyForecast] = useState(false);

  // Favorites management
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (initialViewMode === 'daily') {
      setShowDailyForecast(true);
    }
  }, [initialViewMode]);

  useEffect(() => {
    loadCharts();
  }, []);

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
      console.error('Error loading charts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartDetails = async (chartId: string) => {
    setIsLoadingBundle(true);
    try {
      const response = await chartAPI.getChartBundle(chartId);
      setSelectedChart(response.data);
      // Only reset views if we are NOT in a specific mode from URL
      if (!initialViewMode) {
        setShowDailyForecast(false);
      }
      // toast.success('Chart loaded successfully'); // Optional, maybe too noisy on auto-load
    } catch (error: any) {
      toast.error('Failed to load chart details');
      console.error('Error loading chart:', error);
    } finally {
      setIsLoadingBundle(false);
    }
  };

  const handleDeleteChart = async (chartId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm('Are you sure you want to delete this chart?')) return;

    try {
      await chartAPI.deleteChart(chartId);
      toast.success('Chart deleted successfully');
      setCharts(charts.filter(c => c.chart_id !== chartId));
      if (selectedChart?.chart_id === chartId) {
        setSelectedChart(null);
      }
    } catch (error) {
      toast.error('Failed to delete chart');
      console.error('Error deleting chart:', error);
    }
  };

  const viewChart = (chartId: string) => {
    if (onViewChart) {
      onViewChart(chartId);
    } else {
      fetchChartDetails(chartId);
    }
  };

  const handleChatClick = () => {
    if (selectedChart && onSelectChart) {
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
          if (onViewChart) {
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
      {/* Search & Filter */}
      <ChartSearch
        charts={charts}
        onFilteredChange={setFilteredCharts}
      />

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      }`}
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
                    {isLoadingBundle ? 'Loading...' : 'View Cosmic Details'}
                  </Button>
                  <Button
                    onClick={(e) => handleDeleteChart(chart.chart_id, e)}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50 backdrop-blur-sm bg-card/80 overflow-hidden shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Large Cosmic Icon */}
                <div className="h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-pulse-glow">
                  <div className="text-4xl">🪐</div>
                </div>

                <div>
                  <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary">
                    {selectedChart.base?.request_subject?.name || 'Unknown Chart'}
                  </CardTitle>

                  {/* Compact Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-sm bg-background/50 border border-primary/10 px-2.5 py-1 rounded-full text-muted-foreground shadow-sm">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" />
                      <span>{selectedChart.base?.request_subject?.dob || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm bg-background/50 border border-primary/10 px-2.5 py-1 rounded-full text-muted-foreground shadow-sm">
                      <Clock className="h-3.5 w-3.5 text-green-400" />
                      <span>{selectedChart.base?.request_subject?.time || 'N/A'}</span>
                    </div>

                    {selectedChart.base?.request_subject?.location && (
                      <div className="flex items-center gap-1.5 text-sm bg-background/50 border border-primary/10 px-2.5 py-1 rounded-full text-muted-foreground shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-red-400" />
                        <span>{selectedChart.base.request_subject.location.city || 'Unknown City'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-center mt-2 md:mt-0">
                <button
                  onClick={() => toggleFavorite(selectedChart.chart_id)}
                  title={isFavorite(selectedChart.chart_id) ? 'Remove from favorites' : 'Add to favorites'}
                  className="p-2.5 rounded-full hover:bg-yellow-500/10 transition-colors border border-transparent hover:border-yellow-500/20"
                >
                  <Star
                    className={`h-5 w-5 ${isFavorite(selectedChart.chart_id)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-muted-foreground hover:text-yellow-500'
                      }`}
                  />
                </button>
                <Button
                  onClick={() => {
                    const newState = !showDailyForecast;
                    setShowDailyForecast(newState);
                    if (newState) onViewModeChange?.('daily');
                    else onViewModeChange?.(null);
                  }}
                  variant="outline"
                  size="sm"
                  className={`border-yellow-500/50 hover:bg-yellow-500/10 ${showDailyForecast ? 'bg-yellow-500/10' : ''} transition-all`}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                  {showDailyForecast ? 'Hide Forecast' : 'Daily Forecast'}
                </Button>
                <Button
                  onClick={handleChatClick}
                  variant="default"
                  size="sm"
                  className="cosmic-glow shadow-lg shadow-primary/20"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
                <Button onClick={closeChartDetails} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Daily Transits Section */}
            {showDailyForecast && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <DailyCosmicChat key={selectedChart.chart_id} chartId={selectedChart.chart_id} />
              </div>
            )}

            {/* PDF Report Card - Always visible */}
            <div className="mb-6 animate-in fade-in duration-500">
              <PDFReportCard
                chartId={selectedChart.chart_id}
                chartName={selectedChart.base?.request_subject?.name || 'Your Chart'}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartList;
