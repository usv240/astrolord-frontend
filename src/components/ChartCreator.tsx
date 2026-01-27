import { useState } from 'react';
import { chartAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CitySearch, CityResult } from './CitySearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface ChartCreatorProps {
  onSuccess?: () => void;
}

const ChartCreator = ({ onSuccess }: ChartCreatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    time: '',
    city: '',
    lat: '',
    lon: '',
    tz: '',
  });

  const handleCitySelect = (city: CityResult) => {
    setFormData(prev => ({
      ...prev,
      city: city.city,
      lat: city.lat.toString(),
      lon: city.lon.toString(),
      tz: city.tz
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const chartData = {
        name: formData.name || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob,
        time: timeUnknown ? '12:00' : formData.time,
        time_unknown: timeUnknown,
        location: {
          city: formData.city || undefined,
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lon: formData.lon ? parseFloat(formData.lon) : undefined,
          tz: formData.tz || undefined,
        },
        options: {
          layout: 'north' as const,
          includeAshtakavarga: false,
        },
      };

      await chartAPI.createChart(chartData);
      toast.success('Chart created successfully!');
      
      setFormData({
        name: '',
        gender: '',
        dob: '',
        time: '',
        city: '',
        lat: '',
        lon: '',
        tz: '',
      });
      setTimeUnknown(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create chart');
      console.error('Chart creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name (Optional)</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-muted/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger className="bg-muted/50 border-border/50">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            required
            className="bg-muted/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time of Birth</Label>
          <Input
            id="time"
            type="time"
            value={timeUnknown ? '12:00' : formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required={!timeUnknown}
            disabled={timeUnknown}
            className="bg-muted/50 border-border/50"
          />
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox 
                id="timeUnknown" 
                checked={timeUnknown}
                onCheckedChange={(checked) => {
                    setTimeUnknown(checked as boolean);
                    if (checked) {
                        setFormData(prev => ({ ...prev, time: '12:00' }));
                    } else {
                        setFormData(prev => ({ ...prev, time: '' }));
                    }
                }}
            />
            <Label htmlFor="timeUnknown" className="text-sm font-normal text-muted-foreground cursor-pointer">
              I don't know exact time (Use 12:00 PM)
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>City of Birth</Label>
        <CitySearch 
          onSelect={handleCitySelect} 
          className="w-full"
        />
      </div>

      {/* Hidden inputs to store precise location data, but kept visible for debugging if needed (or make hidden type) */}
      <div className="grid grid-cols-3 gap-4 opacity-50 text-xs">
        <div>Lat: {formData.lat || '-'}</div>
        <div>Lon: {formData.lon || '-'}</div>
        <div>TZ: {formData.tz || '-'}</div>
      </div>

      <Button
        type="submit"
        className="w-full cosmic-glow"
        disabled={isLoading || !formData.lat || !formData.lon}
      >
        {isLoading ? 'Creating Chart...' : 'Create Chart'}
      </Button>
    </form>
  );
};

export default ChartCreator;
