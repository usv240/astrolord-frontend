/**
 * Logger Utility for AstroLord Frontend
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured JSON logging
 * - Console output in development
 * - Sends errors to analytics in production
 * - In-memory log buffer for debugging
 * - Optional localStorage persistence
 * - Context enrichment (user, page, timestamp)
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('Debug message', { someData: 123 });
 * logger.info('Info message');
 * logger.warn('Warning message', { context: 'auth' });
 * logger.error('Error message', { error: err });
 * ```
 */

import { trackError, trackApiError } from '@/lib/analytics';

// ============================================================================
// Types
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  page?: string;
}

interface LoggerConfig {
  /** Minimum level to log (default: 'debug' in dev, 'warn' in prod) */
  minLevel: LogLevel;
  /** Enable console output (default: true in dev, false in prod) */
  enableConsole: boolean;
  /** Send errors to analytics (default: true) */
  enableAnalytics: boolean;
  /** Store logs in memory buffer (default: true) */
  enableBuffer: boolean;
  /** Max logs to keep in buffer (default: 100) */
  bufferSize: number;
  /** Persist logs to localStorage (default: false) */
  persistToStorage: boolean;
  /** Storage key for persisted logs */
  storageKey: string;
  /** Max logs to persist (default: 50) */
  maxPersistedLogs: number;
}

// ============================================================================
// Configuration
// ============================================================================

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isDev ? 'debug' : 'warn',
  enableConsole: isDev,
  enableAnalytics: isProd,
  enableBuffer: true,
  bufferSize: 100,
  persistToStorage: false,
  storageKey: 'astrolord_logs',
  maxPersistedLogs: 50,
};

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Console styling for different levels
const CONSOLE_STYLES: Record<LogLevel, { badge: string; style: string }> = {
  debug: {
    badge: '🔍 DEBUG',
    style: 'color: #888; font-weight: normal;',
  },
  info: {
    badge: 'ℹ️ INFO',
    style: 'color: #3b82f6; font-weight: normal;',
  },
  warn: {
    badge: '⚠️ WARN',
    style: 'color: #f59e0b; font-weight: bold;',
  },
  error: {
    badge: '❌ ERROR',
    style: 'color: #ef4444; font-weight: bold;',
  },
};

// ============================================================================
// Logger Class
// ============================================================================

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private userId: string | null = null;
  private currentPage: string = '';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadPersistedLogs();
  }

  // ===========================================================================
  // Configuration
  // ===========================================================================

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set current user ID for log context
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Set current page for log context
   */
  setCurrentPage(page: string): void {
    this.currentPage = page;
  }

  // ===========================================================================
  // Logging Methods
  // ===========================================================================

  /**
   * Debug level - development only, detailed debugging info
   */
  debug(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log('debug', message, context, module);
  }

  /**
   * Info level - general information, successful operations
   */
  info(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log('info', message, context, module);
  }

  /**
   * Warn level - potential issues, non-critical problems
   */
  warn(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log('warn', message, context, module);
  }

  /**
   * Error level - errors that need attention
   */
  error(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log('error', message, context, module);
  }

  /**
   * Log an Error object with full stack trace
   */
  exception(error: Error, context?: Record<string, unknown>, module?: string): void {
    const entry = this.createEntry('error', error.message, context, module);
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    this.processEntry(entry);
  }

  /**
   * Log an API error with endpoint info
   */
  apiError(
    endpoint: string,
    statusCode: number,
    errorMessage: string,
    context?: Record<string, unknown>
  ): void {
    const entry = this.createEntry('error', `API Error: ${endpoint}`, {
      ...context,
      endpoint,
      statusCode,
      errorMessage,
    }, 'api');

    this.processEntry(entry);

    // Track in analytics
    if (this.config.enableAnalytics) {
      trackApiError(endpoint, statusCode, errorMessage);
    }
  }

  // ===========================================================================
  // Core Logging Logic
  // ===========================================================================

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    module?: string
  ): void {
    // Check if level meets minimum threshold
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry = this.createEntry(level, message, context, module);
    this.processEntry(entry);
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    module?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      module,
      context,
      userId: this.userId || undefined,
      page: this.currentPage || undefined,
    };
  }

  private processEntry(entry: LogEntry): void {
    // 1. Console output
    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }

    // 2. Buffer storage
    if (this.config.enableBuffer) {
      this.addToBuffer(entry);
    }

    // 3. Persist to localStorage
    if (this.config.persistToStorage) {
      this.persistLogs();
    }

    // 4. Send errors to analytics
    if (this.config.enableAnalytics && entry.level === 'error') {
      trackError(
        entry.message,
        entry.module || 'unknown',
        false
      );
    }
  }

  private writeToConsole(entry: LogEntry): void {
    const style = CONSOLE_STYLES[entry.level];
    const prefix = `%c${style.badge}`;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    const args: unknown[] = [
      `${prefix} [${timestamp}]${entry.module ? ` [${entry.module}]` : ''} ${entry.message}`,
      style.style,
    ];

    // Add context if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      args.push(entry.context);
    }

    // Add error stack if present
    if (entry.error?.stack) {
      args.push('\n' + entry.error.stack);
    }

    // Use appropriate console method
    switch (entry.level) {
      case 'debug':
        console.debug(...args);
        break;
      case 'info':
        console.info(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        break;
    }
  }

  // ===========================================================================
  // Buffer Management
  // ===========================================================================

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);

    // Trim buffer if exceeds max size
    if (this.buffer.length > this.config.bufferSize) {
      this.buffer = this.buffer.slice(-this.config.bufferSize);
    }
  }

  /**
   * Get all logs from buffer
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.buffer.filter(entry => entry.level === level);
    }
    return [...this.buffer];
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.buffer.slice(-count);
  }

  /**
   * Clear all logs from buffer
   */
  clearLogs(): void {
    this.buffer = [];
    if (this.config.persistToStorage) {
      try {
        localStorage.removeItem(this.config.storageKey);
      } catch {
        // Ignore storage errors
      }
    }
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.buffer, null, 2);
  }

  /**
   * Download logs as a file
   */
  downloadLogs(filename?: string): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `astrolord-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===========================================================================
  // Persistence
  // ===========================================================================

  private persistLogs(): void {
    try {
      const logsToStore = this.buffer.slice(-this.config.maxPersistedLogs);
      localStorage.setItem(this.config.storageKey, JSON.stringify(logsToStore));
    } catch {
      // localStorage might be full or disabled
    }
  }

  private loadPersistedLogs(): void {
    if (!this.config.persistToStorage) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as LogEntry[];
        this.buffer = parsed;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // ===========================================================================
  // Performance Helpers
  // ===========================================================================

  /**
   * Create a timer for performance logging
   */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { duration_ms: Math.round(duration) }, 'performance');
    };
  }

  /**
   * Log with automatic grouping (for console)
   */
  group(label: string, fn: () => void): void {
    if (this.config.enableConsole) {
      console.group(label);
    }
    try {
      fn();
    } finally {
      if (this.config.enableConsole) {
        console.groupEnd();
      }
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const logger = new Logger();

// ============================================================================
// Module-specific Logger Factory
// ============================================================================

/**
 * Create a module-specific logger
 * 
 * @example
 * const log = createLogger('AuthContext');
 * log.info('User logged in', { userId: '123' });
 */
export function createLogger(moduleName: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      logger.debug(message, context, moduleName),
    info: (message: string, context?: Record<string, unknown>) =>
      logger.info(message, context, moduleName),
    warn: (message: string, context?: Record<string, unknown>) =>
      logger.warn(message, context, moduleName),
    error: (message: string, context?: Record<string, unknown>) =>
      logger.error(message, context, moduleName),
    exception: (error: Error, context?: Record<string, unknown>) =>
      logger.exception(error, context, moduleName),
    apiError: (endpoint: string, statusCode: number, errorMessage: string, context?: Record<string, unknown>) =>
      logger.apiError(endpoint, statusCode, errorMessage, context),
    time: (label: string) => logger.time(`[${moduleName}] ${label}`),
  };
}

// ============================================================================
// Global Error Handler Integration
// ============================================================================

/**
 * Initialize global error handling
 * Call this once in your app's entry point
 */
export function initGlobalErrorHandler(): void {
  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error('Uncaught error', {
      message: String(message),
      source,
      lineno,
      colno,
    }, 'global');

    if (error) {
      logger.exception(error, { source, lineno, colno }, 'global');
    }

    return false; // Don't prevent default handling
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: String(event.reason),
    }, 'global');

    if (event.reason instanceof Error) {
      logger.exception(event.reason, {}, 'global');
    }
  });

  logger.info('Global error handler initialized', {}, 'global');
}

export default logger;
