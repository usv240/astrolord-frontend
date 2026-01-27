import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { initializeGA } from '@/utils/analytics';
import { GOOGLE_ANALYTICS_ID } from '@/config/seo-config';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import AdminUsers from './pages/AdminUsers';
import AdminPayments from './pages/AdminPayments';
import AdminPromo from './pages/AdminPromo';
import AdminPricing from './pages/AdminPricing';
import AdminSystem from './pages/AdminSystem';
import AdminModeration from './pages/AdminModeration';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Learn from './pages/Learn';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import RefundPolicy from './pages/RefundPolicy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ServiceUnavailable from './pages/ServiceUnavailable';
import PaymentStatus from './pages/PaymentStatus';
import FeedbackPage from './pages/FeedbackPage';
import CookieConsent from './components/CookieConsent';
import PublicLayout from './components/PublicLayout';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  useEffect(() => {
    // Initialize Google Analytics on app load
    initializeGA(GOOGLE_ANALYTICS_ID);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="astrolord-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <CookieConsent />
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
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
