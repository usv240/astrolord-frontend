import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const log = createLogger('ResetPassword');

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const urlEmail = searchParams.get('email');
  const urlOtp = searchParams.get('otp');
  const urlMode = searchParams.get('mode');

  // Form state
  const [email, setEmail] = useState(urlEmail || '');
  const [otp, setOtp] = useState(urlOtp || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useOtpMode, setUseOtpMode] = useState(!token || urlMode === 'otp');

  const navigate = useNavigate();

  // If we have a token, user token mode by default unless OTP mode explicitly requested
  useEffect(() => {
    if (token && urlMode !== 'otp') {
      setUseOtpMode(false);
    } else if (urlMode === 'otp') {
      setUseOtpMode(true);
    }
  }, [token, urlMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (useOtpMode) {
        // OTP-based reset
        if (!email || !otp) {
          toast.error("Please enter your email and OTP code");
          setIsLoading(false);
          return;
        }
        await authAPI.resetPasswordWithOTP(email, otp, password);
      } else {
        // Token-based reset
        if (!token) {
          toast.error("Invalid reset link");
          setIsLoading(false);
          return;
        }
        await authAPI.resetPassword(token, password);
      }

      setIsSuccess(true);
      toast.success('Password reset successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      log.error('Reset password error', { error: String(error) });
      const errorMessage = error.response?.data?.detail || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        <Card className="w-full max-w-md relative border-border/50 backdrop-blur-sm bg-card/80">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Password Reset Complete!</h2>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully updated. Redirecting you to login...
                </p>
              </div>
              <Button asChild className="w-full mt-4">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <Card className="w-full max-w-md relative border-border/50 backdrop-blur-sm bg-card/80">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 hover:bg-transparent hover:text-primary z-10"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <CardHeader className="space-y-1 text-center pt-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 cosmic-glow">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {useOtpMode
              ? "Enter your email, OTP code, and new password"
              : "Create a strong new password for your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Toggle between token and OTP mode */}
          {token && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setUseOtpMode(!useOtpMode)}
                className="text-xs text-primary hover:underline"
              >
                {useOtpMode ? "Use the reset link instead" : "Use OTP code instead"}
              </button>
            </div>
          )}

          {!token && !useOtpMode && (
            <div className="mb-6 p-4 bg-destructive/10 rounded-lg text-center">
              <p className="text-sm text-destructive mb-2">Invalid or missing reset link</p>
              <button
                type="button"
                onClick={() => setUseOtpMode(true)}
                className="text-xs text-primary hover:underline"
              >
                Use OTP code instead
              </button>
              <p className="text-xs text-muted-foreground mt-2">or</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link to="/forgot-password">Request new reset link</Link>
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email & OTP fields for OTP mode */}
            {useOtpMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="bg-muted/50 border-border/50 text-center text-xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your password reset email
                  </p>
                </div>
              </>
            )}

            {/* Password fields */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-muted/50 border-border/50 pr-10"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 pr-10"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password match indicator */}
            {password && confirmPassword && (
              <div className={`text-xs flex items-center gap-1 ${password === confirmPassword ? 'text-green-500' : 'text-destructive'}`}>
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <span className="text-destructive">✕</span>
                    Passwords don't match
                  </>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full cosmic-glow"
              disabled={isLoading || (password !== confirmPassword) || password.length < 8 || (useOtpMode && (!email || otp.length !== 6))}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
