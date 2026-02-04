import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowLeft, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const log = createLogger('ForgotPassword');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Reset code sent to your email');
    } catch (error: any) {
      log.error('Forgot password error', { error: String(error) });
      const errorMessage = error.response?.data?.detail || 'Failed to send reset instructions. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    // Navigate to reset password page with email and OTP pre-filled via state/context would be ideal,
    // but for now we'll just navigate to the reset page where they can switch to OTP mode.
    // Ideally we pass this state to the next route or use a callback.
    // For a smoother UX, let's navigate to the reset page but in "OTP mode"
    navigate('/reset-password');

    // NOTE: Better UX would be to handle the OTP verification here or pass param.
    // Since ResetPassword page handles the actual reset logic (new password entry),
    // we should guide them there.
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <Card className="w-full max-w-md relative border-border/50 backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 cosmic-glow">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSubmitted
              ? "Check your email for the reset code"
              : "Enter your email to receive a reset code"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-6">
              {/* Success Info */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Code Sent Successfully</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {/* OTP Entry Shortcut */}
              <div className="bg-muted/30 rounded-lg p-5 border border-border/50 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-center block">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                    maxLength={6}
                  />
                </div>
                <Button
                  className="w-full cosmic-glow"
                  onClick={() => {
                    // Since ResetPassword page needs to know we want to use OTP,
                    // We can't easily pass state via simple link unless we use state param.
                    // But simpler is to just let the user re-enter it there or 
                    // update ResetPassword to accept query params for pre-filling.
                    navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}&mode=otp`);
                  }}
                  disabled={otp.length !== 6}
                >
                  Verify & Set New Password <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Alternative Options */}
              <div className="text-center space-y-3 pt-2">
                <div className="text-xs text-muted-foreground">
                  Or click the link in the email we sent you
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs"
                >
                  Change email address
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full cosmic-glow"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
