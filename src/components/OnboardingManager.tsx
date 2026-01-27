import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingTutorial, OnboardingStep } from './OnboardingTutorial';
import { NotificationPrompt } from './NotificationPrompt';
import { authAPI } from '@/lib/api';

interface OnboardingManagerProps {
  onComplete?: () => void;
  forcedStart?: boolean; // For testing
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: 'Create Your Birth Chart',
    description:
      'Your birth chart is the cosmic blueprint of your life. It shows the positions of celestial bodies at your exact moment of birth. Let\'s create it!',
    icon: '📊',
    details: [
      'Click the "Create" tab to add a new chart',
      'Enter your birth date, time, and location (your data is encrypted and private)',
      'Our AI generates your personalized Vedic chart in seconds',
      'You can save multiple charts for family members or different times',
    ],
    estimatedTime: '~1 minute',
  },
  {
    step: 2,
    title: 'Chat with AI Astrologer',
    description:
      'Ask our specialized AI anything about your chart. It\'s trained on authentic Vedic texts and understands your unique cosmic profile. All messages are encrypted—only you can see them.',
    icon: '💬',
    details: [
      'Select your chart and open the AI chat',
      'Ask anything! Example: "What does my chart say about my career path?"',
      'Try: "Are there any strong yogas for wealth in my chart?"',
      'Questions about love: "When will I find a life partner based on my chart?"',
      'Health & wellness: "Which planetary periods are favorable for health improvements?"',
      'Remedies: "What remedies can help strengthen my Jupiter placement?"',
      'Get instant personalized insights—your questions and data are encrypted and private',
    ],
    estimatedTime: '~2 minutes',
  },
  {
    step: 3,
    title: 'Explore More Features',
    description:
      'Unlock deeper insights with transits, relationship matching, remedies, and daily cosmic guidance. Everything is secure and private.',
    icon: '🌟',
    details: [
      '📅 Daily Cosmic Insights: See how current planetary transits affect you today',
      '💕 Relationship Matching: Compare your chart with others (Premium feature)',
      '🔮 Planetary Remedies: Get specific recommendations for life improvements',
      '📈 Yearly Forecast: Understand cosmic trends for the next 12 months',
      '✨ Track Progress: Monitor your cosmic journey and personal growth over time',
      '🔐 Your data is always encrypted and never shared with third parties',
    ],
    estimatedTime: '~2 minutes',
  },
];

// Storage key for tracking onboarding state
const ONBOARDING_KEY = 'astrolord_onboarding_completed';
const SKIP_WELCOME_KEY = 'astrolord_skip_welcome';

export const OnboardingManager = ({
  onComplete,
  forcedStart = false,
}: OnboardingManagerProps) => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Initialize onboarding when user loads
  useEffect(() => {
    if (!user) return;

    // Check BOTH: backend status AND localStorage
    // Backend is the source of truth - localStorage is just for quick cache
    const localCompleted = localStorage.getItem(ONBOARDING_KEY);
    const backendCompleted = (user as any).onboarding_completed;
    const skipWelcome = localStorage.getItem(SKIP_WELCOME_KEY);

    // Sync localStorage with backend (if backend says completed, update localStorage)
    if (backendCompleted && !localCompleted) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }

    // Show tutorial only if BOTH are false (or forcedStart)
    // This ensures new users always see it, even on new devices
    const isCompleted = backendCompleted || localCompleted;

    if (forcedStart || !isCompleted) {
      // Short delay to ensure smooth transition after login
      const timer = setTimeout(() => {
        if (skipWelcome) {
          // Skip welcome and go directly to tutorial
          setShowTutorial(true);
          setShowWelcome(false);
          setTutorialStep(0);
        } else {
          // Show welcome first
          setShowWelcome(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, forcedStart]);

  // Listen for direct tutorial trigger
  useEffect(() => {
    const handleShowTutorial = () => {
      setShowWelcome(false);
      setShowTutorial(true);
      setTutorialStep(0);
      // Clear the skip welcome flag
      localStorage.removeItem(SKIP_WELCOME_KEY);
    };

    window.addEventListener('astrolord-show-tutorial', handleShowTutorial);
    return () => window.removeEventListener('astrolord-show-tutorial', handleShowTutorial);
  }, []);

  const handleStartOnboarding = () => {
    setShowWelcome(false);
    setShowTutorial(true);
    setTutorialStep(0);
    // Track analytics event
    trackOnboardingEvent('welcome_completed');
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    completeOnboarding();
  };

  const handleNextStep = () => {
    if (tutorialStep < ONBOARDING_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
      trackOnboardingEvent('tutorial_step', {
        step: tutorialStep + 1,
      });
    }
  };

  const handlePreviousStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleCompleteTutorial = () => {
    // Show notification prompt after tutorial completion
    setShowTutorial(false);
    setShowNotificationPrompt(true);
    trackOnboardingEvent('tutorial_completed');
  };

  const handleSkipTutorial = () => {
    // Show notification prompt even if user skips tutorial
    setShowTutorial(false);
    setShowNotificationPrompt(true);
    trackOnboardingEvent('tutorial_skipped');
  };

  const handleNotificationComplete = () => {
    setShowNotificationPrompt(false);
    completeOnboarding();
  };

  const handleNotificationSkip = () => {
    setShowNotificationPrompt(false);
    completeOnboarding();
    trackOnboardingEvent('notification_prompt_skipped');
  };

  const completeOnboarding = async () => {
    // Mark onboarding as completed in localStorage
    localStorage.setItem(ONBOARDING_KEY, 'true');
    // Clear the skip welcome flag when tutorial is done
    localStorage.removeItem(SKIP_WELCOME_KEY);

    // Sync to backend (fire and forget - don't block UI)
    try {
      await authAPI.completeOnboarding();
    } catch (error) {
      console.warn('Failed to sync onboarding status to backend:', error);
      // Don't block the UI - localStorage is already set
    }

    // Track analytics
    trackOnboardingEvent('onboarding_completed');

    // Reset UI
    setShowWelcome(false);
    setShowTutorial(false);

    // Callback
    onComplete?.();
  };

  const trackOnboardingEvent = (eventName: string, details?: Record<string, any>) => {
    // Track event for analytics (will be sent to backend)
    const event = new CustomEvent('onboarding-event', {
      detail: {
        event: eventName,
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        ...details,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      {showWelcome && (
        <OnboardingWelcome
          userName={user?.name}
          onStart={handleStartOnboarding}
          onSkip={handleSkipWelcome}
        />
      )}

      {showTutorial && (
        <OnboardingTutorial
          currentStep={tutorialStep}
          steps={ONBOARDING_STEPS}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          onComplete={handleCompleteTutorial}
          onSkip={handleSkipTutorial}
        />
      )}

      {showNotificationPrompt && (
        <NotificationPrompt
          onComplete={handleNotificationComplete}
          onSkip={handleNotificationSkip}
        />
      )}
    </>
  );
};

// Helper function to show tutorial directly without reload
export const showTutorialDirectly = () => {
  const event = new Event('astrolord-show-tutorial');
  window.dispatchEvent(event);
};

// Helper function to reset onboarding (for testing)
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  // Set flag to skip welcome and go directly to tutorial
  localStorage.setItem(SKIP_WELCOME_KEY, 'true');
};

export default OnboardingManager;
