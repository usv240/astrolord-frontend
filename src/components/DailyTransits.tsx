import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { transitsAPI } from '@/lib/api';

interface DailyTransitsProps {
  chartId?: string;
}

const DailyTransits = ({ chartId }: DailyTransitsProps) => {
  const [transits, setTransits] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransits = async () => {
      if (!chartId) return;
      
      try {
        setLoading(true);
        setError(null);
        const res = await transitsAPI.getDailyTransits(chartId);
        setTransits(res.data);
      } catch (err) {
        console.error("Failed to fetch transits", err);
        setError("Unable to load transits.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransits();
  }, [chartId]);

  if (!chartId) return null;

  return (
    <Card className="mb-6 border-border/50 bg-card/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Daily Cosmic Weather
        </CardTitle>
        <CardDescription>Personalized planetary transits for this chart</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Aligning planets...</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : transits ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transits.transits?.map((t: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-primary">{t.planet} in {t.transit_sign}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {t.house_from_moon}th from Moon
                </div>
                <div className="text-sm leading-snug">{t.prediction}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No transit data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTransits;
