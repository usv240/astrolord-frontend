import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SortAsc, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Chart {
  chart_id: string;
  name?: string;
  dob: string;
  time: string;
  city?: string;
  created_at: string;
}

interface ChartSearchProps {
  charts: Chart[];
  onFilteredChange: (filtered: Chart[]) => void;
  onSortChange?: (sortBy: string) => void;
}

type SortOption = 'recent' | 'oldest' | 'alphabetical' | 'reverse-alpha';

export const ChartSearch = ({
  charts,
  onFilteredChange,
  onSortChange,
}: ChartSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort charts
  const filteredCharts = useMemo(() => {
    let result = [...charts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((chart) => {
        const name = (chart.name || '').toLowerCase();
        const city = (chart.city || '').toLowerCase();
        const dob = chart.dob.toLowerCase();
        return (
          name.includes(query) ||
          city.includes(query) ||
          dob.includes(query)
        );
      });
    }

    // Date range filter
    if (dateRangeStart || dateRangeEnd) {
      result = result.filter((chart) => {
        const chartDate = new Date(chart.created_at);
        if (dateRangeStart && chartDate < new Date(dateRangeStart)) return false;
        if (dateRangeEnd) {
          const endDate = new Date(dateRangeEnd);
          endDate.setHours(23, 59, 59, 999);
          if (chartDate > endDate) return false;
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return (a.name || 'Unnamed').localeCompare(b.name || 'Unnamed');
        case 'reverse-alpha':
          return (b.name || 'Unnamed').localeCompare(a.name || 'Unnamed');
        default:
          return 0;
      }
    });

    return result;
  }, [charts, searchQuery, sortBy, dateRangeStart, dateRangeEnd]);

  // Notify parent of filtered results
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (value: string) => {
    const newSort = value as SortOption;
    setSortBy(newSort);
    onSortChange?.(newSort);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateRangeStart('');
    setDateRangeEnd('');
    setSortBy('recent');
  };

  // Update parent whenever filters change
  useEffect(() => {
    onFilteredChange(filteredCharts);
  }, [filteredCharts, onFilteredChange]);

  const hasActiveFilters =
    searchQuery || dateRangeStart || dateRangeEnd || sortBy !== 'recent';
  const resultCount = filteredCharts.length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${searchQuery ? 'text-primary' : 'text-muted-foreground'}`} />
          <Input
            placeholder="Search by name, city, or birth date..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`pl-10 pr-10 border-border/50 transition-all duration-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${searchQuery ? 'border-primary/30' : ''}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 animate-in fade-in zoom-in-50"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`border-border/50 transition-all duration-200 ${showFilters ? 'cosmic-glow' : 'hover:border-primary/50'}`}
          title={showFilters ? 'Hide filters' : 'Show filters'}
        >
          <SortAsc className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-secondary/5 border border-secondary/30 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Sort Option */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Sort By</label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  <span className="flex items-center gap-2">
                    📅 Most Recent
                  </span>
                </SelectItem>
                <SelectItem value="oldest">🕐 Oldest First</SelectItem>
                <SelectItem value="alphabetical">A→Z Alphabetical</SelectItem>
                <SelectItem value="reverse-alpha">Z→A Reverse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">From</label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border/50 bg-background text-foreground text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">To</label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border/50 bg-background text-foreground text-sm"
              />
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Results Summary */}
      {searchQuery || dateRangeStart || dateRangeEnd ? (
        <div className="text-xs text-muted-foreground flex items-center justify-between animate-in fade-in slide-in-from-bottom-1 duration-200">
          <span>
            Found <span className="font-semibold text-foreground">{resultCount}</span> chart
            {resultCount !== 1 ? 's' : ''}
            {resultCount === 0 && <span className="text-yellow-500 ml-1">— try adjusting your filters</span>}
          </span>
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChartSearch;
