import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingTutorial, OnboardingStep } from './OnboardingTutorial';
import { NotificationPrompt } from './NotificationPrompt';
import { authAPI } from '@/lib/api';
import { createLogger } from '@/utils/logger';

const log = createLogger('OnboardingManager');

interface OnboardingManagerProps {
  onComplete?: () => void;
  forcedStart?: boolean; // For testing
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: 'Welcome to Astrolord',
    description: 'Your AI-powered Vedic astrology guide. Just 3 simple tabs:',
    icon: '🧭',
    details: [
      '🏠 Home — Create charts, view charts, see daily transits',
      '💬 Chat — Talk to AI Astrologer about your chart',
      '💕 Match — Check relationship compatibility',
    ],
    estimatedTime: '~10 seconds',
  },
  {
    step: 2,
    title: 'Home Tab: Your Dashboard',
    description: 'Everything starts here. Create and manage your birth charts.',
    icon: '🏠',
    details: [
      '✨ Tap "Create Chart" → Enter birth date, time & place',
      '📊 View all your saved charts anytime',
      '🌅 See today\'s transits and how planets affect YOU',
      '💡 Tip: Accurate birth time = more precise readings',
    ],
    estimatedTime: '~20 seconds',
  },
  {
    step: 3,
    title: 'Chat Tab: AI Astrologer',
    description: 'Ask anything about your chart. Use Focus Modes for specific topics.',
    icon: '💬',
    details: [
      '1. Select your chart to chat about it',
      '2. Pick a Focus Mode: Career, Love, Health, Finance, or Spiritual',
      '3. Ask questions like:',
      '   "What career suits me?" • "When will I find love?"',
    ],
    estimatedTime: '~20 seconds',
  },
  {
    step: 4,
    title: 'Match Tab: Relationships',
    description: 'Compare two charts for marriage compatibility using Vedic Kundli matching.',
    icon: '💕',
    details: [
      '1. Enter birth details of both people',
      '2. Get Ashtakoot score (out of 36) + detailed analysis',
      '3. Ask: "When to marry?" • "What issues might we face?"',
      '4. Remedies for improving compatibility',
    ],
    estimatedTime: '~20 seconds',
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

  const handleGoToStep = (step: number) => {
    if (step >= 0 && step < ONBOARDING_STEPS.length) {
      setTutorialStep(step);
      trackOnboardingEvent('tutorial_step_jump', { from: tutorialStep, to: step });
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
      log.warn('Failed to sync onboarding status to backend', { error: String(error) });
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
          onGoToStep={handleGoToStep}
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
