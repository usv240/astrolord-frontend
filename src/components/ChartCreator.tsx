import { useState, useEffect } from 'react';
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
import { useConfetti } from './Confetti';
import { useFormDraft } from '@/hooks/useFormDraft';
import { getErrorMessage } from '@/utils/errorHelpers';
import { createLogger } from '@/utils/logger';
import { trackChartCreated, trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

const log = createLogger('ChartCreator');

interface ChartCreatorProps {
  onSuccess?: () => void;
  onChartCreated?: (showLoading?: boolean) => Promise<void>;
}

const initialFormData = {
  name: '',
  gender: '',
  dob: '',
  time: '',
  city: '',
  lat: '',
  lon: '',
  tz: '',
};

const ChartCreator = ({ onSuccess, onChartCreated }: ChartCreatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const { trigger: triggerConfetti, ConfettiComponent } = useConfetti();

  // Auto-save draft functionality
  const {
    data: formData,
    setData: setFormData,
    resetData,
    hasDraft,
    restoreDraft,
    dismissDraft,
    clearDraft,
  } = useFormDraft({
    key: 'chart_creator',
    initialData: initialFormData,
    debounceMs: 500,
    showToasts: false, // We'll handle toasts ourselves
  });

  // Track form start when user begins filling
  const handleInputFocus = () => {
    if (!hasStartedForm) {
      setHasStartedForm(true);
      trackFormStart('chart_creator');
    }
  };

  const handleCitySelect = (city: CityResult) => {
    setFormData({
      city: city.city,
      lat: city.lat.toString(),
      lon: city.lon.toString(),
      tz: city.tz
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // DEBUG: Check for auth token presence
    const token = localStorage.getItem('authToken');
    log.info('Submitting chart creation request', { hasToken: !!token, tokenLength: token?.length });


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

      // Track chart creation for analytics
      trackChartCreated('birth_chart');
      trackFormSubmit('chart_creator', true);

      // Trigger confetti celebration! 🎉
      triggerConfetti();

      toast.success('🎉 Chart created successfully!', {
        description: 'Your cosmic blueprint is ready to explore.',
        duration: 4000,
      });

      // Clear draft and reset form
      clearDraft();
      resetData();
      setTimeUnknown(false);
      setHasStartedForm(false);

      // Refresh quota after chart creation
      if (onChartCreated) {
        await onChartCreated();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      trackFormSubmit('chart_creator', false);
      toast.error(getErrorMessage(error, 'Failed to create chart'));
      log.error('Chart creation failed', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConfettiComponent />

      {/* Draft Restore Banner */}
      {hasDraft && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-primary shrink-0" />
            <span>You have an unsaved draft. Would you like to restore it?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={restoreDraft}
              className="h-7 px-2 text-xs border-primary/30 hover:bg-primary/10"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restore
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={dismissDraft}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" onFocus={handleInputFocus}>
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
    </>
  );
};

export default ChartCreator;
