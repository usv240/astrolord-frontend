import { useState, useEffect, useRef } from 'react';
import { chartAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createLogger } from '@/utils/logger';

const log = createLogger('CitySearch');

export interface CityResult {
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
}

interface CitySearchProps {
  onSelect: (city: CityResult) => void;
  className?: string;
  defaultValue?: string;
}

export function CitySearch({ onSelect, className, defaultValue }: CitySearchProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isSelecting = useRef(false);

  useEffect(() => {
    if (isSelecting.current) {
      isSelecting.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        try {
          const response = await chartAPI.searchCities(query);
          setResults(response.data.results || []);
          setIsOpen(true);
        } catch (error) {
          log.error('City search failed', { error: String(error) });
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    isSelecting.current = true;
    setQuery(city.name); // Display full name
    setIsOpen(false);
    onSelect(city);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search city (e.g. Mumbai, New York)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.length >= 3) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Delay closing so click registers
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="pl-9 bg-muted/50 border-border/50"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {results.map((city, index) => (
              <li
                key={`${city.lat}-${city.lon}-${index}`}
                className="px-4 py-2 hover:bg-muted/50 cursor-pointer text-sm flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before click
                  handleSelect(city);
                }}
              >
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{city.city}</span>
                  <span className="text-xs text-muted-foreground">
                    {city.state ? `${city.state}, ` : ''}{city.country}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.length >= 3 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          No cities found. Try a different spelling.
        </div>
      )}
    </div>
  );
}

