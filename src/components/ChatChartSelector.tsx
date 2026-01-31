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
  birth_date: string;
  birth_time: string;
  birth_place: string;
  created_at: string;
  sun_sign?: string;
  moon_sign?: string;
  ascendant?: string;
}

interface ChatChartSelectorProps {
  onSelectChart: (chartId: string) => void;
  onCreateChart: () => void;
}

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
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 animate-pulse-glow">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Charts Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first birth chart to start chatting with our AI astrologer about your cosmic blueprint.
            </p>
            <Button onClick={onCreateChart} className="cosmic-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Chart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Select a Chart to Chat About
        </CardTitle>
        <CardDescription>
          Choose which birth chart you'd like to explore with our AI astrologer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {charts.map((chart) => (
            <button
              key={chart.chart_id}
              onClick={() => onSelectChart(chart.chart_id)}
              className="group p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {chart.name}
                </h4>
                <Star className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(chart.birth_date).toLocaleDateString()} at {chart.birth_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{chart.birth_place}</span>
                </div>
              </div>
              {(chart.sun_sign || chart.moon_sign || chart.ascendant) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
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
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onCreateChart} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create New Chart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ChatChartSelector.displayName = 'ChatChartSelector';

export default ChatChartSelector;

