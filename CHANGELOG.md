# Changelog

All notable changes to AstroLord Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.0] - 2026-01-31

### Added

#### SEO & Meta Tags
- **React Helmet Async** - Dynamic document head management for SEO
- **SEO Component** (`src/components/SEO.tsx`) - Reusable component for meta tags
- **PageSEO Component** - Pre-configured SEO for common pages
- Added SEO to Index, Pricing, About, Learn, FAQ, and Login pages
- Open Graph and Twitter Card meta tags for social sharing
- Canonical URLs and robots meta tags

#### Performance Monitoring
- **Web Vitals Tracking** (`src/utils/webVitals.ts`) - Core Web Vitals monitoring
- Tracks LCP, FID, CLS, FCP, TTFB, and INP metrics
- Rating system (good/needs-improvement/poor) based on Google thresholds
- Integration with Google Analytics for metric reporting
- Development-mode debugging with colored emoji indicators

#### Constants & Configuration
- **Constants File** (`src/config/constants.ts`) - Centralized configuration
- Duration constants: animations, debounce, toasts, timeouts
- Polling intervals: subscription status, live stats, chat updates
- Cache settings: stale time, garbage collection time
- UI limits: message length, page sizes, file upload limits
- API settings: retry counts, timeouts
- Storage keys: auth tokens, themes, drafts
- Feature flags for easy toggling
- Zodiac constants: signs, planets, houses

#### Testing Infrastructure
- **Vitest Setup** - Modern testing framework
- Test utilities with custom render function
- Mock providers for QueryClient, Router, Theme
- Sample tests for logger and constants
- npm scripts: `test`, `test:run`, `test:coverage`
- 30 passing tests

#### Rate Limiting UX
- **useRateLimit Hook** (`src/hooks/useRateLimit.ts`) - Rate limit with countdown
- Visual countdown timer when rate limited
- Persisted rate limit state across page refreshes
- `handleRateLimitError` helper for API error handling
- Rate limit indicator in chat input
- Disabled input and send button during cooldown

### Changed

#### PWA Manifest Enhancements
- Added app shortcuts for quick actions (Create Chart, Daily Horoscope, AI Chat)
- Multiple icon sizes for better device support
- Display override settings for better installation
- Updated theme color and start URL

#### QueryClient Optimization
- Now uses constants for staleTime and gcTime
- Centralized cache configuration

---

## [1.4.0] - 2026-01-31

### Added

#### Centralized Logging System
- **Logger Utility** (`src/utils/logger.ts`) - Comprehensive frontend logging solution
- Multiple log levels: `debug`, `info`, `warn`, `error`
- Structured JSON logging with timestamps
- Module-specific loggers via `createLogger('ModuleName')`
- In-memory log buffer for debugging (configurable size)
- Analytics integration for production error tracking
- Performance timing with `logger.time()`
- Exception logging with stack traces
- Export logs as JSON or download as file
- Global error handler for uncaught errors and promise rejections

### Changed

#### Console.log Migration
- Replaced 90+ console.log/error/warn calls across 40+ files with centralized logger
- Components: ChartCreator, ChartList, CentralizedChat, RelationshipMatch, AIChat, and 15+ more
- Lib files: api.ts, firebase.ts
- Hooks: useCopyToClipboard, useFormDraft, useNotifications, useSubscription, useQuotaPlans
- Pages: Dashboard, Login, Register, Pricing, and 8+ more admin pages
- Dev-only console output preserved for analytics initialization (circular dependency avoidance)

### Documentation
- Added `LOGGING_SYSTEM.md` with comprehensive usage guide
- Documented log levels, configuration, and best practices
- Listed all migrated files for reference

---

## [1.3.0] - 2026-01-31

### Added

#### Error Handling & Recovery
- **ErrorBoundary Component** - Catches JavaScript errors with friendly UI and retry options
- "Try Again" button to re-render failed components
- "Go to Dashboard" for safe navigation
- "Copy Error Details" for support tickets
- Custom error event dispatch for analytics

#### User Guidance
- **Contextual Tips System** - First-time user hints and feature discovery
- `TipProvider` context for app-wide tip management
- `ContextualTip` component for element-attached tips
- `FloatingTip` component for standalone tips
- Predefined tips for favorites, keyboard shortcuts, daily forecast, etc.
- LocalStorage persistence for seen tips

#### Progress Indicators
- **ProgressSteps Component** - Multi-step form progress visualization
- Three variants: default, compact, vertical
- Clickable steps for navigation
- Animated progress bar
- SimpleProgress alternative for simple bars

#### Mobile Enhancements
- **Pull-to-Refresh Hook** - Native-like refresh gesture on mobile
- Touch gesture detection with configurable threshold
- Visual indicator with rotation animation
- Haptic feedback on threshold reach
- **Haptic Feedback Utility** - Cross-platform vibration feedback
- Multiple intensities: light, medium, heavy, success, error, selection
- `useHaptics()` hook for React integration

#### Chat Improvements
- **Enhanced Typing Indicator** - Animated brain icon with sparkles
- "AI is thinking" text with bouncing dots
- Replaced plain loading message

#### Chart Management
- **Copy Chart ID Button** - One-click copy for chart IDs
- Visual feedback with checkmark icon
- Uses `useCopyToClipboard` hook
- **Undo Delete Functionality** - 5-second window to undo chart deletion
- Optimistic UI updates
- Toast with "Undo" action button
- Automatic restoration on undo

#### Celebrations
- **Confetti on Match Success** - Celebration animation for relationship matches
- Triggers on successful match analysis

#### Session Management
- **Session Timeout Warning** - Warns users before session expires
- Activity tracking (mouse, keyboard, scroll, touch)
- Visual countdown timer with progress bar
- "Stay Logged In" to extend session
- Auto-logout when expired

### Changed

- Chat loading now uses `TypingIndicator` instead of plain text
- Chart delete uses optimistic UI with undo capability
- RelationshipMatch triggers confetti on success

---

## [1.2.0] - 2026-01-31

### Added

#### Mobile & Accessibility
- **Settings Mobile Navigation** - Bottom nav bar for Settings page with Dashboard/Settings/Logout
- **Keyboard Shortcuts** - Escape/Arrow keys for onboarding navigation
- **useKeyboardShortcuts Hook** - Reusable hook for keyboard event handling

#### Form Improvements
- **Password Strength Indicator** - Visual feedback during password change
- Real-time strength calculation with progress bar
- Requirements checklist with checkmarks

#### Visual Feedback
- **Favorites Star Animation** - Bounce animation when starring/unstarring charts
- **Chart Bundle Skeleton** - Loading skeleton when fetching chart details
- **Enhanced Favorites Cards** - Hover effects with lift and glow

#### User Experience
- **Clickable Onboarding Dots** - Jump to any step by clicking indicators
- **AlertDialog Confirmations** - Replaced native `confirm()` with styled dialogs
- **Enhanced Chart Search** - Animated clear button and filter toggle
- **Improved Notification Banner** - Better mobile layout, clearer dismiss

#### Theme
- **Smooth Theme Transitions** - All elements transition smoothly between themes
- **Enhanced Theme Toggle** - Icons in dropdown, animation on change, current theme highlighted

### Changed

#### Components
- `useFavorites` hook now returns `isAnimating` function
- Onboarding tutorial accepts `onGoToStep` prop
- Chart deletion uses AlertDialog instead of native confirm
- Match deletion uses AlertDialog instead of native confirm

#### Styling
- Added `animate-star-pop` keyframe animation
- Added `animate-theme-switch` keyframe animation
- All elements now transition theme-related properties (200ms)
- Notification banner has responsive layout improvements

---

## [1.1.0] - 2026-01-31

### Added

#### Mobile Experience
- **Mobile Bottom Navigation** - New `MobileBottomNav.tsx` component providing iOS/Android-style tab bar
- Bottom nav includes: Home, Charts, Create, Chat, and Match tabs
- Safe area padding for notched devices
- Pulse indicator on Create button

#### Chat Enhancements
- **Inline Chart Selector** - New `ChatChartSelector.tsx` for selecting charts directly in Chat tab
- **Message Timestamps** - Relative time display ("2m ago", "yesterday") on all messages
- **Quick Action Buttons** - One-tap buttons for Transits, Career, Love, and Remedies queries
- **Contextual Feedback Modal** - Dynamic emoji, titles, and placeholders based on feedback type

#### Dashboard Improvements
- **Usage Stats Cards** - Display charts used, messages today, hourly limit, and plan type
- **Recent Charts Section** - Quick access to 3 most recent charts
- **Loading Skeletons** - Proper loading states with skeleton placeholders
- **Staggered Animations** - Fade-in effects with delays for better UX

#### Visual Enhancements
- **Enhanced Empty States** - Animated cosmic illustrations for no-data scenarios
- **Pricing Card Redesign** - Clear visual hierarchy with featured Monthly plan
- **Sidebar Active Indicator** - Left border accent bar and icon scaling
- **Micro-Animations** - Button press effects, hover lifts, shine effects

### Changed

#### Styling
- **Light Mode Colors** - Warmer cream tones with subtle purple/blue gradients
- **Button Component** - Added `active:scale-[0.98]` press effect to all buttons
- **Button Shadows** - Hover now adds variant-colored shadow
- **Outline Buttons** - Border changes to primary color on hover

#### Navigation
- Chat tab no longer redirects when no chart selected (shows inline selector instead)
- Dashboard main content has bottom padding for mobile nav

### Fixed
- Removed confusing toast redirect when accessing Chat without chart

---

## [1.0.0] - 2026-01-15

### Added
- Initial release of AstroLord Frontend
- Birth chart generation with Vedic astrology calculations
- AI Chat integration for personalized insights
- User authentication (email + Google OAuth)
- Chart management (create, view, delete)
- Relationship compatibility matching
- Dark/Light theme support
- Responsive design for mobile and desktop
- Google Analytics integration
- Firebase push notifications
- Razorpay payment integration (Coming Soon)

---

## File Changes in v1.3.0

### New Files
| File | Type | Description |
|------|------|-------------|
| `src/components/ErrorBoundary.tsx` | Component | Error catching with retry UI |
| `src/components/ContextualTip.tsx` | Component | First-time user tips system |
| `src/components/ProgressSteps.tsx` | Component | Multi-step form progress indicator |
| `src/hooks/usePullToRefresh.ts` | Hook | Mobile pull-to-refresh gesture |
| `src/utils/haptics.ts` | Utility | Haptic feedback functions and hook |
| `src/components/SessionTimeoutWarning.tsx` | Component | Session expiry warning modal |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/CentralizedChat.tsx` | Integrated TypingIndicator component |
| `src/components/ChartList.tsx` | Copy Chart ID button, useUndoDelete integration |
| `src/components/RelationshipMatch.tsx` | Confetti on match success |
| `UI_IMPROVEMENTS.md` | Added Session 3 documentation |
| `CHANGELOG.md` | Added v1.3.0 section |

---

## File Changes in v1.2.0

### New Files
| File | Type | Description |
|------|------|-------------|
| `src/components/PasswordStrengthIndicator.tsx` | Component | Password strength visual feedback |
| `src/hooks/useKeyboardShortcuts.ts` | Hook | Keyboard shortcut management |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/Settings.tsx` | Added mobile bottom nav, password strength indicator |
| `src/components/FavoritesManager.tsx` | Enhanced hover effects, animation tracking |
| `src/components/OnboardingTutorial.tsx` | Clickable dots, keyboard shortcuts |
| `src/components/OnboardingManager.tsx` | Added onGoToStep handler |
| `src/components/ChartSearch.tsx` | Enhanced animations and clear button |
| `src/components/ChartList.tsx` | AlertDialog for delete, skeleton loading, star animation |
| `src/pages/Dashboard.tsx` | AlertDialog for match delete |
| `src/components/NotificationBanner.tsx` | Improved mobile layout, clearer dismiss |
| `src/components/ThemeToggle.tsx` | Animation, icons, current theme highlight |
| `src/index.css` | Theme transitions, star animation, theme switch animation |

---

## File Changes in v1.1.0

### New Files
| File | Type | Description |
|------|------|-------------|
| `src/components/MobileBottomNav.tsx` | Component | Mobile bottom tab navigation |
| `src/components/ChatChartSelector.tsx` | Component | Inline chart picker for chat |
| `UI_IMPROVEMENTS.md` | Docs | Detailed documentation of UI changes |
| `CHANGELOG.md` | Docs | This changelog file |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Added MobileBottomNav, ChatChartSelector imports and integration |
| `src/components/DashboardHome.tsx` | Added usage stats, recent charts, skeletons, animations |
| `src/components/DashboardNav.tsx` | Added active state indicator, hover effects |
| `src/pages/Pricing.tsx` | Redesigned cards with visual hierarchy |
| `src/components/CentralizedChat.tsx` | Added timestamps, feedback modal, quick actions |
| `src/components/EmptyStates.tsx` | Added animated illustrations |
| `src/components/ui/button.tsx` | Added press animation, consistent shadows |
| `src/index.css` | Added light mode improvements, utility classes |
| `README.md` | Added UI improvements section |

---

## Upgrade Guide

No breaking changes. Simply pull the latest changes and restart the dev server:

```bash
git pull origin main
npm install
npm run dev
```

---

*Maintained by the AstroLord Team*

