import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface FavoriteChart {
  chart_id: string;
  name?: string;
  dob: string;
  time: string;
  city?: string;
}

interface FavoritesManagerProps {
  charts: FavoriteChart[];
  favorites: Set<string>;
  onToggleFavorite: (chartId: string) => void;
  onSelectChart: (chartId: string) => void;
}

export const FavoritesManager = ({
  charts,
  favorites,
  onToggleFavorite,
  onSelectChart,
}: FavoritesManagerProps) => {
  const favoriteCharts = charts.filter((c) => favorites.has(c.chart_id));

  if (favoriteCharts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <h3 className="font-semibold text-sm">Favorite Charts</h3>
        <span className="text-xs text-muted-foreground">({favoriteCharts.length})</span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {favoriteCharts.map((chart) => (
          <Card
            key={chart.chart_id}
            className="border-yellow-500/30 backdrop-blur-sm bg-gradient-to-br from-yellow-500/5 to-card/50 hover:bg-yellow-500/10 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {chart.name || 'Unnamed Chart'}
                  </CardTitle>
                  <CardDescription className="text-xs space-y-1 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="truncate">{chart.dob}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{chart.time}</span>
                    </div>
                    {chart.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{chart.city}</span>
                      </div>
                    )}
                  </CardDescription>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(chart.chart_id);
                  }}
                  className="shrink-0 mt-1"
                  title="Remove from favorites"
                >
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 hover:scale-110 transition-transform" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectChart(chart.chart_id)}
                variant="outline"
                size="sm"
                className="w-full border-yellow-500/30 text-xs h-8"
              >
                View Chart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Hook to manage favorites in localStorage
export const useFavorites = (storageKey = 'astrolord_favorite_charts') => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(Array.isArray(parsed) ? parsed : []));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites, storageKey, isLoaded]);

  const toggleFavorite = (chartId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(chartId)) {
        newFavorites.delete(chartId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(chartId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  const isFavorite = (chartId: string) => favorites.has(chartId);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
};

export default FavoritesManager;
