import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus, Star, Calendar, MapPin, Sparkles } from 'lucide-react';
import { chartAPI } from '@/lib/api';
import { createLogger } from '@/utils/logger';

const log = createLogger('ChatChartSelector');

interface Chart {
  chart_id: string;
  name: string;
  dob: string;  // API returns 'dob' not 'birth_date'
  time: string; // API returns 'time' not 'birth_time'
  city?: string; // API returns 'city' not 'birth_place'
  created_at: string;
  sun_sign?: string;
  moon_sign?: string;
  ascendant?: string;
}

interface ChatChartSelectorProps {
  onSelectChart: (chartId: string, mode?: 'analysis' | 'daily') => void;
  onCreateChart: () => void;
}

// Helper function to safely format birth date
const formatBirthDate = (dateString: string | undefined | null, timeString?: string): string => {
  if (!dateString) {
    return timeString ? `Time: ${timeString}` : 'Date not available';
  }

  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return timeString ? `Time: ${timeString}` : 'Date not available';
    }

    const formattedDate = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
  } catch {
    return timeString ? `Time: ${timeString}` : 'Date not available';
  }
};

export const ChatChartSelector = memo(({ onSelectChart, onCreateChart }: ChatChartSelectorProps) => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await chartAPI.getMyCharts();
        setCharts(response.data.charts || []);
      } catch (error) {
        log.error('Failed to load charts', { error: String(error) });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharts();
  }, []);

  // Click chart -> go directly to chat (default to analysis mode)
  const handleChartClick = (chartId: string) => {
    onSelectChart(chartId, 'analysis');
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (charts.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-8 sm:py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 sm:mb-6 animate-pulse-glow">
              <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">No Charts Yet</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6 max-w-md">
              Create your first birth chart to start chatting with our AI astrologer.
            </p>
            <Button onClick={onCreateChart} className="cosmic-glow" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Chart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Chart selection view - default view
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Select a Chart to Chat About
        </h3>
        <p className="text-sm text-muted-foreground">
          Click any chart to start chatting with our AI astrologer
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {charts.map((chart) => (
          <Card
            key={chart.chart_id}
            className="group relative overflow-hidden border-border/50 backdrop-blur-sm bg-card/60 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:bg-card/80 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleChartClick(chart.chart_id)}
          >
            {/* Star Icon */}
            <div className="absolute top-3 right-3 z-20">
              <Star className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
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
                  <p className="text-xs text-muted-foreground">Click to chat</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground/80">
                <div className="flex items-center gap-2 bg-secondary/10 p-2 rounded-md">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" />
                  <span className="truncate">{chart.dob || 'No date'}</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/10 p-2 rounded-md">
                  <Sparkles className="h-3.5 w-3.5 text-green-400" />
                  <span className="truncate">{chart.time || 'No time'}</span>
                </div>
                {chart.city && (
                  <div className="col-span-2 flex items-center gap-2 bg-secondary/10 p-2 rounded-md">
                    <MapPin className="h-3.5 w-3.5 text-red-400" />
                    <span className="truncate">{chart.city}</span>
                  </div>
                )}
              </div>

              {(chart.sun_sign || chart.moon_sign || chart.ascendant) && (
                <div className="flex flex-wrap gap-1.5">
                  {chart.sun_sign && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent border border-accent/20">
                      ☉ {chart.sun_sign}
                    </span>
                  )}
                  {chart.moon_sign && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                      ☽ {chart.moon_sign}
                    </span>
                  )}
                  {chart.ascendant && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20">
                      ↑ {chart.ascendant}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={onCreateChart} className="w-full mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Create New Chart
      </Button>
    </div>
  );
});

ChatChartSelector.displayName = 'ChatChartSelector';

export default ChatChartSelector;
