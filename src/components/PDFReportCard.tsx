import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  FileText,
  Download,
  Check,
  Star,
  Sparkles,
  Award,
  Calendar,
  Home,
  TrendingUp,
  Zap,
  Clock,
  Shield,
  Rocket,
} from 'lucide-react';
import { authenticatedApi } from '@/lib/api';
import { paymentAPI } from '@/lib/payment-api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createLogger } from '@/utils/logger';

const log = createLogger('PDFReportCard');

interface ReportPreview {
  chart_id: string;
  chart_name: string;
  preview: {
    planetary_positions: number;
    house_cusps: number;
    divisional_charts: number;
    detected_yogas: number;
    dasha_periods_included: number;
    total_pages_estimated: number;
  };
  sections: string[];
  sample_yogas: string[];
}

interface ReportPurchase {
  purchase_id: string;
  chart_id: string;
  chart_name: string;
  report_type: string;
  purchased_at: string;
  amount_paid: number;
  currency: string;
  generation_count: number;
  last_generated: string | null;
}

interface PDFReportCardProps {
  chartId: string;
  chartName?: string;
}

export function PDFReportCard({ chartId, chartName }: PDFReportCardProps) {
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [purchase, setPurchase] = useState<ReportPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [testDownloading, setTestDownloading] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadReportInfo();
    loadPricing();
  }, [chartId]);

  const loadReportInfo = async () => {
    try {
      setLoading(true);

      // Use default preview immediately (report generated after payment)
      setPreview({
        chart_id: chartId,
        chart_name: chartName || 'Your Chart',
        preview: {
          planetary_positions: 10,
          house_cusps: 12,
          divisional_charts: 3,
          detected_yogas: 5,
          dasha_periods_included: 6,
          total_pages_estimated: 20,
        },
        sections: [
          'Complete Life Overview',
          'Personality & Traits',
          'Career & Success Path',
          'Relationships & Love',
          'Health & Wellness',
          'Financial Prospects',
          'Spiritual Growth',
          'Current & Upcoming Dashas',
        ],
        sample_yogas: ['Gajakesari', 'Parivartana', 'Neechabhanga'],
      });

      // Check if already purchased
      try {
        const purchasesRes = await authenticatedApi.get('/reports/my-reports');
        const existingPurchase = purchasesRes.data.reports.find(
          (r: ReportPurchase) => r.chart_id === chartId,
        );
        setPurchase(existingPurchase || null);
      } catch (purchaseErr: any) {
        // If can't fetch purchases, that's OK - just no existing purchase
        log.debug('Could not fetch existing purchases');
        setPurchase(null);
      }
    } catch (error: any) {
      log.error('Error loading report info', { error: error.message });
      const errorMsg = error.response?.data?.detail || 'Failed to load report information';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };
  const loadPricing = async () => {
    try {
      setPricingLoading(true);
      const res = await paymentAPI.getPricing();
      const reportProduct = res.data.pricing.find((p: any) => p.product_key === 'one_time_report');
      if (reportProduct) {
        setPricing({
          ...reportProduct,
          country_name: res.data.country_name,
          currency: res.data.currency,
        });
      } else {
        // Fallback pricing if product not found
        log.warn('Report product not found in pricing list, using default');
        setPricing({
          product_key: 'one_time_report',
          amount: 299, // $2.99 default
          currency: res.data.currency || 'INR',
          country_name: res.data.country_name || 'India',
        });
      }
    } catch (error) {
      log.error('Error loading pricing', { error: String(error) });
      // Use fallback pricing instead of showing error
      setPricing({
        product_key: 'one_time_report',
        amount: 299,
        currency: 'INR',
        country_name: 'India',
      });
    } finally {
      setPricingLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);

      // Create payment order
      const orderRes = await paymentAPI.createOrder(['one_time_report']);
      const order = orderRes.data.order;

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.razorpay_amount,
        currency: order.currency,
        name: 'AstroLord',
        description: 'Birth Chart PDF Report',
        order_id: order.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Record purchase
            await authenticatedApi.post('/reports/purchase', {
              chart_id: chartId,
              payment_order_id: response.razorpay_order_id,
            });

            toast({
              title: 'Success!',
              description: 'Payment successful. You can now download your PDF report.',
            });

            // Reload report info
            await loadReportInfo();
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Payment verification failed. Please contact support.',
            });
          }
        },
        prefill: {
          name: chartName || '',
        },
        theme: {
          color: '#667EEA',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      log.error('Purchase error', { error: error.message });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to initiate purchase',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await authenticatedApi.post(
        '/reports/generate',
        {
          chart_id: chartId,
          include_divisionals: true,
          include_dashas: true,
          include_yogas: true,
        },
        {
          responseType: 'blob',
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `birth_chart_${chartName || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded!',
        description: 'Your PDF report has been downloaded successfully.',
      });

      // Reload to update generation count
      await loadReportInfo();
    } catch (error: any) {
      log.error('Download error', { error: error.message });
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error.response?.data?.detail || 'Failed to generate PDF. Please try again.',
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading || pricingLoading) {
    return (
      <Card className="w-full border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="flex flex-col items-center justify-center p-8 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-sm text-muted-foreground">Loading report details...</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    if (error) {
      return (
        <Card className="w-full border-2 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  return (
    <Card className="w-full border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20 shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              Complete Birth Chart PDF Report
            </CardTitle>
            <CardDescription className="text-base">
              Professional Vedic astrology report • {preview.preview.total_pages_estimated}+
              beautifully designed pages •
              {pricing?.currency === 'USD'
                ? `$${pricing?.final_price || '1.50'} only`
                : `${pricing?.currency_symbol}${pricing?.final_price || '25'} only`}
            </CardDescription>
          </div>
          {purchase && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              <Check className="h-3 w-3 mr-1" />
              Purchased
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Features */}
        <div className="bg-white dark:bg-card rounded-xl p-5 border-2 border-purple-100 dark:border-purple-800 shadow-sm">
          <h4 className="font-bold text-base mb-4 flex items-center gap-2 text-purple-900 dark:text-purple-300">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Complete Vedic Analysis Included
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Planetary Analysis */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">Planetary Positions</h5>
                <p className="text-xs text-muted-foreground">
                  All {preview.preview.planetary_positions} planets with signs, degrees, houses &
                  nakshatras
                </p>
              </div>
            </div>

            {/* House System */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">House Cusps & Lords</h5>
                <p className="text-xs text-muted-foreground">
                  All {preview.preview.house_cusps} houses with signs, degrees & ruling planets
                </p>
              </div>
            </div>

            {/* Divisional Charts */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">Divisional Charts</h5>
                <p className="text-xs text-muted-foreground">
                  D1 (Rasi), D9 (Navamsa), D10 (Career), D12, D30
                </p>
              </div>
            </div>

            {/* Dasha Periods */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">Dasha Timeline</h5>
                <p className="text-xs text-muted-foreground">
                  Current & upcoming Vimshottari Dasha periods
                </p>
              </div>
            </div>

            {/* Yogas */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">Special Yogas Detected</h5>
                <p className="text-xs text-muted-foreground">
                  Up to 15 yogas with descriptions & strength analysis
                </p>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">Key Highlights</h5>
                <p className="text-xs text-muted-foreground">
                  Ascendant, Moon Sign & Sun Sign summary
                </p>
              </div>
            </div>

            {/* Shadbala - Planetary Strength */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-900/10">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <Award className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-0.5">Shadbala Strength</h5>
                <p className="text-xs text-muted-foreground">
                  Planetary power levels (Very Strong to Very Weak)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Info */}
        {purchase ? (
          <Alert className="bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm text-green-900 dark:text-green-300">
              <strong>Report purchased!</strong> You've downloaded this {purchase.generation_count}{' '}
              time
              {purchase.generation_count !== 1 ? 's' : ''}.
              {purchase.last_generated &&
                ` Last download: ${new Date(purchase.last_generated).toLocaleDateString()}`}
              <br />
              <span className="text-xs text-green-700 dark:text-green-400">
                Download anytime • No limits • Forever yours
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl p-[2px]">
            <div className="bg-white dark:bg-card rounded-[10px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {pricing?.currency_symbol || '$'}
                      {pricing?.final_price?.toFixed(2) || '1.50'}
                    </span>
                    {pricing?.tier_discount_percent > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {pricing.currency_symbol}
                        {(pricing.final_price / (1 - pricing.tier_discount_percent / 100)).toFixed(
                          2,
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    One-time payment • Unlimited downloads • {pricing?.currency || 'USD'}
                  </p>
                </div>
                {pricing?.tier_discount_percent > 0 && (
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-base px-3 py-1">
                      SAVE {Math.round(pricing.tier_discount_percent)}%
                    </Badge>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center gap-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Lifetime Access</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">Unlimited</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-muted-foreground">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Features */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {preview.preview.total_pages_estimated}+
            </div>
            <div className="text-xs text-green-600 dark:text-green-500">Pages</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">∞</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Downloads</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">✓</div>
            <div className="text-xs text-purple-600 dark:text-purple-500">Print Ready</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {purchase ? (
          <>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              size="lg"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF Report Now
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground flex items-center gap-2 justify-center">
              <PartyPopper className="h-4 w-4 text-primary" /> Thank you for your purchase! Download
              your report anytime.
            </p>
          </>
        ) : (
          <>
            <div className="relative">
              <Button
                disabled={true}
                className="w-full bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 text-white shadow-lg text-base py-6 cursor-not-allowed opacity-90"
                size="lg"
              >
                <Clock className="mr-2 h-5 w-5" />
                Get Your Complete Report • {pricing?.currency_symbol || '$'}
                {pricing?.final_price?.toFixed(2) || '1.50'}
              </Button>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                  <Rocket className="h-3 w-3" /> Coming Soon
                </span>
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 justify-center">
                <Sparkles className="h-3 w-3" /> Payment integration launching soon!
              </p>
              <p className="flex items-center gap-2 justify-center flex-wrap">
                <Check className="h-3 w-3" /> Instant download • <Check className="h-3 w-3" /> Pay
                once, keep forever • <Check className="h-3 w-3" /> 100% secure payment
              </p>
              <p className="text-[10px]">
                {pricingLoading
                  ? 'Loading pricing...'
                  : `${pricing?.currency_symbol}${pricing?.final_price?.toFixed(2)}`}{' '}
                • Powered by Razorpay
              </p>
            </div>
          </>
        )}

        {/* Admin Test Download Button */}
        {user?.is_admin && (
          <div className="mt-4 pt-4 border-t border-dashed border-amber-500/50">
            <Button
              onClick={async () => {
                setTestDownloading(true);
                try {
                  toast({
                    title: 'Generating PDF...',
                    description: 'This may take 10-20 seconds (AI analysis + Shadbala)',
                  });

                  const response = await authenticatedApi.post(
                    `/debug/test-pdf/${chartId}`,
                    {},
                    { responseType: 'blob' },
                  );

                  // Create download link
                  const blob = new Blob([response.data], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `TEST_birth_chart_${chartName || 'report'}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);

                  toast({
                    title: '✅ PDF Downloaded!',
                    description: 'Check your downloads folder',
                  });
                } catch (err: any) {
                  log.error('Test PDF error', { error: err.message });
                  toast({
                    variant: 'destructive',
                    title: 'PDF Generation Failed',
                    description: err.response?.data?.detail || err.message || 'Unknown error',
                  });
                } finally {
                  setTestDownloading(false);
                }
              }}
              disabled={testDownloading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              size="lg"
            >
              {testDownloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  🔧 Admin: Test Download PDF
                </>
              )}
            </Button>
            <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
              Admin-only test button (bypasses payment)
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}
