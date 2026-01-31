import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * 
 * Features:
 * - Friendly error UI with cosmic theme
 * - Retry functionality
 * - Navigation back to dashboard
 * - Copy error details for bug reports
 * - Tracks errors for analytics
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error using centralized logger
    logger.exception(error, { componentStack: errorInfo.componentStack }, 'ErrorBoundary');
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Track error in analytics
    try {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      }));
    } catch {
      // Silently fail if event dispatch fails
    }
  }

  handleRetry = (): void => {
    this.setState({ isRetrying: true });
    
    // Small delay for visual feedback
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 500);
  };

  handleGoHome = (): void => {
    window.location.href = '/dashboard';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      // Visual feedback could be added here
    } catch {
      logger.error('Failed to copy error details', {}, 'ErrorBoundary');
    }
  };

  render(): ReactNode {
    const { hasError, error, isRetrying } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <Card className="w-full max-w-lg relative border-destructive/30 backdrop-blur-sm bg-card/90 animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="text-center pb-4">
              {/* Error Icon with Animation */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center border border-destructive/30">
                    <AlertTriangle className="h-10 w-10 text-destructive animate-bounce" />
                  </div>
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-destructive">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Don't worry, your data is safe. The cosmos just had a temporary glitch.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-muted-foreground">
                  <code className="break-all">{error.message}</code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="w-full cosmic-glow"
                  size="lg"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>

                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                </div>
              </div>

              {/* Copy Error Details */}
              <div className="pt-4 border-t border-border/50">
                <Button
                  onClick={this.handleCopyError}
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Copy Error Details for Support
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-center text-muted-foreground">
                If this keeps happening, please{' '}
                <a href="/contact" className="text-primary hover:underline">
                  contact support
                </a>
                {' '}with the error details.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Functional wrapper for use with hooks
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
