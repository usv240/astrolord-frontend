import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect, Suspense, lazy, memo } from 'react';
import { initializeGA } from '@/utils/analytics';
import { GOOGLE_ANALYTICS_ID } from '@/config/seo-config';
import { CACHE } from '@/config/constants';
import ErrorBoundary from '@/components/ErrorBoundary';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { CommandPalette } from '@/components/CommandPalette';
import { SkipToContent } from '@/components/SkipToContent';
import ScrollToTop from '@/components/ScrollToTop';

// Lazy load non-critical components
const Toaster = lazy(() => import('@/components/ui/toaster').then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import('@/components/ui/sonner').then(m => ({ default: m.Toaster })));
const TooltipProvider = lazy(() => import('@/components/ui/tooltip').then(m => ({ default: m.TooltipProvider })));
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const PublicLayout = lazy(() => import('./components/PublicLayout'));

// Lazy load all pages for code splitting
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminPromo = lazy(() => import('./pages/AdminPromo'));
const AdminPricing = lazy(() => import('./pages/AdminPricing'));
const AdminSystem = lazy(() => import('./pages/AdminSystem'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Learn = lazy(() => import('./pages/Learn'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const About = lazy(() => import('./pages/About'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ServiceUnavailable = lazy(() => import('./pages/ServiceUnavailable'));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

// Optimized QueryClient with caching and deduplication
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE.STALE_TIME,
      gcTime: CACHE.GC_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Loading fallback component
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
));
PageLoader.displayName = 'PageLoader';

const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
});
ProtectedRoute.displayName = 'ProtectedRoute';

const App = () => {
  useEffect(() => {
    // Initialize Google Analytics on app load
    initializeGA(GOOGLE_ANALYTICS_ID);
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="astrolord-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <SkipToContent />
                <OfflineIndicator />
                <CommandPalette />
                <CookieConsent />
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public site routes under shared layout */}
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/service-unavailable" element={<ServiceUnavailable />} />
                        <Route path="/payment-status" element={<PaymentStatus />} />
                        <Route path="/feedback" element={<FeedbackPage />} />
                        <Route path="/app/feedback" element={<FeedbackPage />} />
                        <Route path="/coming-soon" element={<ComingSoon />} />
                        <Route path="/roadmap" element={<ComingSoon />} />
                      </Route>
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminOverview />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoute>
                            <AdminUsers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/payments"
                        element={
                          <ProtectedRoute>
                            <AdminPayments />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/promo"
                        element={
                          <ProtectedRoute>
                            <AdminPromo />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/pricing"
                        element={
                          <ProtectedRoute>
                            <AdminPricing />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/system"
                        element={
                          <ProtectedRoute>
                            <AdminSystem />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/system/:tab"
                        element={
                          <ProtectedRoute>
                            <AdminSystem />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/moderation"
                        element={
                          <ProtectedRoute>
                            <AdminModeration />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute>
                            <Analytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
