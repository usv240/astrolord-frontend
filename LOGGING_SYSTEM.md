# AstroLord Frontend Logging System

## Overview

The AstroLord frontend uses a centralized logging system that provides:
- **Structured JSON logging** for consistent log format
- **Multiple log levels** (debug, info, warn, error)
- **Module-specific loggers** for easy identification
- **In-memory log buffer** for debugging
- **Analytics integration** for error tracking in production
- **Developer-friendly console output** with colored badges

## Location

The logger utility is located at:
```
src/utils/logger.ts
```

## Usage

### Basic Usage

```typescript
import { logger } from '@/utils/logger';

logger.debug('Debug message', { someData: 123 });
logger.info('Info message');
logger.warn('Warning message', { context: 'auth' });
logger.error('Error message', { error: err.message });
```

### Module-Specific Logger (Recommended)

```typescript
import { createLogger } from '@/utils/logger';

const log = createLogger('MyComponent');

log.info('Component mounted');
log.error('Failed to fetch data', { error: err.message });
log.debug('State updated', { newState });
```

### Logging Errors with Stack Traces

```typescript
import { logger } from '@/utils/logger';

try {
  // risky operation
} catch (error) {
  logger.exception(error, { context: 'additional info' }, 'ModuleName');
}
```

### API Error Logging

```typescript
import { logger } from '@/utils/logger';

logger.apiError('/api/charts', 500, 'Internal server error', { chartId });
```

## Log Levels

| Level | Use Case | Console Method | Stored |
|-------|----------|----------------|--------|
| `debug` | Detailed debugging info, development only | `console.debug` | Yes (buffer) |
| `info` | General information, successful operations | `console.info` | Yes (buffer) |
| `warn` | Potential issues, non-critical problems | `console.warn` | Yes (buffer) |
| `error` | Errors that need attention, failures | `console.error` | Yes (buffer + analytics) |

## Configuration

The logger can be configured for different environments:

```typescript
import { logger } from '@/utils/logger';

logger.configure({
  minLevel: 'debug',        // Minimum level to log
  enableConsole: true,      // Show in browser console
  enableAnalytics: true,    // Send errors to Firebase Analytics
  enableBuffer: true,       // Keep logs in memory
  bufferSize: 100,          // Max logs to keep
  persistToStorage: false,  // Save to localStorage
});
```

### Default Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| `minLevel` | `debug` | `warn` |
| `enableConsole` | `true` | `false` |
| `enableAnalytics` | `false` | `true` |

## Retrieving Logs

### Get Recent Logs

```typescript
import { logger } from '@/utils/logger';

// Get last 20 logs
const recentLogs = logger.getRecentLogs(20);

// Get all error logs
const errors = logger.getLogs('error');
```

### Export Logs

```typescript
import { logger } from '@/utils/logger';

// Export as JSON string
const jsonLogs = logger.exportLogs();

// Download as file
logger.downloadLogs('debug-session.json');
```

### Clear Logs

```typescript
import { logger } from '@/utils/logger';

logger.clearLogs();
```

## Performance Timing

```typescript
import { logger } from '@/utils/logger';

const endTimer = logger.time('API Call');
await fetchData();
endTimer(); // Logs: "API Call completed" with duration_ms
```

## Global Error Handler

Initialize global error handling in your app's entry point:

```typescript
// In main.tsx
import { initGlobalErrorHandler } from '@/utils/logger';

initGlobalErrorHandler();
```

This captures:
- Uncaught JavaScript errors
- Unhandled promise rejections

## Log Entry Format

Each log entry follows this structure:

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 timestamp
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;        // Human-readable message
  module?: string;        // Source module/component
  context?: object;       // Additional structured data
  error?: {               // Error details (for exceptions)
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;        // Current user (if set)
  page?: string;          // Current page (if set)
}
```

## Console Output Example

In development, logs appear with colored badges:

```
🔍 DEBUG [10:30:45] [AIChat] Session created { sessionId: "abc123" }
ℹ️ INFO  [10:30:46] [Dashboard] User navigated to charts tab
⚠️ WARN  [10:30:47] [Auth] Token expiring soon
❌ ERROR [10:30:48] [API] Request failed { endpoint: "/charts", status: 500 }
```

## Files Updated

The following files were updated to use the centralized logger:

### Components (21 files)
- `ChartCreator.tsx`
- `ChartList.tsx`
- `CentralizedChat.tsx`
- `RelationshipMatch.tsx`
- `AIChat.tsx`
- `ErrorBoundary.tsx`
- `NotificationBanner.tsx`
- `OnboardingManager.tsx`
- `FavoritesManager.tsx`
- `DashboardHome.tsx`
- `ChatChartSelector.tsx`
- `CommandPalette.tsx`
- `PDFReportCard.tsx`
- `CitySearch.tsx`
- `AdminLayout.tsx`
- `ChatHistoryList.tsx`
- `DailyTransits.tsx`
- `NotificationPrompt.tsx`

### Lib (3 files)
- `api.ts`
- `firebase.ts`
- `analytics.ts` (uses dev-only console.warn to avoid circular dependency)

### Hooks (5 files)
- `useCopyToClipboard.ts`
- `useFormDraft.ts`
- `useNotifications.ts`
- `useSubscription.ts`
- `useQuotaPlans.ts`

### Pages (12 files)
- `Pricing.tsx`
- `Dashboard.tsx`
- `AdminDashboard.tsx`
- `AuthCallback.tsx`
- `AdminSystem.tsx`
- `AdminUsers.tsx`
- `ForgotPassword.tsx`
- `FeedbackPage.tsx`
- `NotFound.tsx`
- `Login.tsx`
- `ResetPassword.tsx`
- `Register.tsx`

### Utils (2 files)
- `haptics.ts` (silent failures, no logging needed)
- `analytics.ts` (dev-only debug output)

## Best Practices

1. **Always use `createLogger()`** to create module-specific loggers
2. **Include context objects** for debugging: `log.error('Failed', { error: err.message, userId })`
3. **Use appropriate log levels**:
   - `debug`: Development debugging
   - `info`: Successful operations, state changes
   - `warn`: Recoverable issues, deprecations
   - `error`: Failures, exceptions
4. **Never log sensitive data** (passwords, tokens, PII)
5. **Use `exception()` for Error objects** to capture stack traces

## Integration with Backend

The frontend logs complement the backend logging system in `backend/logs/`:
- `app.log` - All backend logs (INFO and above)
- `error.log` - Backend errors only

Both systems use JSON structured logging for consistency.

---

*Last updated: January 31, 2026*
