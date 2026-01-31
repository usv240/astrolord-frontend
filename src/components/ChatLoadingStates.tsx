import React, { memo } from 'react';
import { Sparkles, Brain, Stars } from 'lucide-react';

/**
 * Animated skeleton loaders for message streaming
 */
export const MessageSkeleton = memo(() => {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-3/4 animate-shimmer" />
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-4/5 animate-shimmer" style={{ animationDelay: '100ms' }} />
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-2/3 animate-shimmer" style={{ animationDelay: '200ms' }} />
      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-5/6 animate-shimmer" style={{ animationDelay: '300ms' }} />
    </div>
  );
});
MessageSkeleton.displayName = 'MessageSkeleton';

/**
 * Enhanced animated typing indicator with cosmic theme
 */
export const TypingIndicator = memo(() => {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="relative">
        <Brain className="h-5 w-5 text-primary animate-pulse" />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-ping" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-primary font-medium">AI is thinking</span>
        <div className="flex items-center gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
        </div>
      </div>
    </div>
  );
});
TypingIndicator.displayName = 'TypingIndicator';

/**
 * Alternative compact typing indicator
 */
export const TypingIndicatorCompact = memo(() => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
    </div>
  );
});
TypingIndicatorCompact.displayName = 'TypingIndicatorCompact';

/**
 * Cosmic loading animation for initial chat load
 */
export const CosmicLoader = memo(({ message = 'Connecting to the cosmos...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in duration-500">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
        {/* Inner ring */}
        <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Stars className="h-6 w-6 text-primary animate-pulse" />
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
});
CosmicLoader.displayName = 'CosmicLoader';

/**
 * Skeleton for suggested questions
 */
export const SuggestionsSkeleton = memo(() => {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-8 bg-muted rounded-full animate-shimmer"
          style={{ width: `${80 + i * 20}px`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
});
SuggestionsSkeleton.displayName = 'SuggestionsSkeleton';
