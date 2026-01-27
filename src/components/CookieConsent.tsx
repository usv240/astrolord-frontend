import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('astrolord_cookie_consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('astrolord_cookie_consent', 'accepted');
    localStorage.setItem('astrolord_consent_date', new Date().toISOString());
    setShowBanner(false);
    // Initialize analytics tracking here if needed
  };

  const handleDecline = () => {
    localStorage.setItem('astrolord_cookie_consent', 'declined');
    localStorage.setItem('astrolord_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">We Use Cookies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience, analyze site traffic, 
                and personalize content. By clicking "Accept", you consent to our use of cookies as described in our{' '}
                <Link to="/privacy" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline font-semibold">
                  Cookie Policy
                </Link>.
              </p>
              
              <details className="mb-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors font-semibold">
                  📋 What cookies do we use?
                </summary>
                <div className="mt-3 text-xs text-muted-foreground space-y-2">
                  <p>
                    <strong>Essential Cookies:</strong> Required for site functionality (authentication, security, preferences)
                  </p>
                  <p>
                    <strong>Analytics Cookies:</strong> Help us understand how you use our site to improve your experience
                  </p>
                  <p>
                    <strong>Marketing Cookies:</strong> Used to track effectiveness of our marketing campaigns
                  </p>
                  <p>
                    <strong>Third-Party Cookies:</strong> From Razorpay (payments) and other service providers
                  </p>
                </div>
              </details>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  className="cosmic-glow"
                  size="sm"
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="border-border/50"
                  size="sm"
                >
                  Decline Non-Essential
                </Button>
              </div>
            </div>

            <button
              onClick={handleDecline}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
