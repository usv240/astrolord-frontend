import React from 'react';

/**
 * Animated skeleton loaders for message streaming
 */
export const MessageSkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-4/5" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  );
};

/**
 * Animated typing indicator
 */
export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
    </div>
  );
};

/**
 * Skeleton for suggested questions
 */
export const SuggestionsSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-8 bg-muted rounded animate-pulse"
          style={{ width: `${60 + Math.random() * 80}px` }}
        />
      ))}
    </div>
  );
};
