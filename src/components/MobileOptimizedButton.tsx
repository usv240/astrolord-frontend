/**
 * MobileOptimizedButton - Centralized button component with touch optimization
 * 
 * Features:
 * - Minimum 44px touch targets
 * - Haptic feedback on tap
 * - Responsive sizing across breakpoints
 * - Accessibility built-in
 * - Loading states optimized for mobile
 * 
 * Usage:
 * <MobileOptimizedButton variant="primary" size="default">
 *   Click Me
 * </MobileOptimizedButton>
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useMobileOptimized';
import { getTouchButtonClasses, RESPONSIVE_CLASSES } from '@/utils/mobile';
import { Loader2 } from 'lucide-react';

interface MobileOptimizedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button size - affects touch target and visual size
   * - tiny: 32px (icon only)
   * - small: 40px (icon buttons)
   * - default: 44px (standard buttons)
   * - large: 48px (prominent actions)
   */
  size?: 'tiny' | 'small' | 'default' | 'large';
  
  /**
   * Visual variant
   */
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  
  /**
   * Enable haptic feedback
   */
  haptic?: boolean;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Full width on mobile, normal on desktop
   */
  fullWidthMobile?: boolean;
  
  /**
   * Whether to use icon button styling
   */
  isIconButton?: boolean;
  
  /**
   * Icon button type (for accessibility)
   */
  iconType?: string;
}

const variantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
  outline: 'border border-input bg-background hover:bg-accent active:bg-accent/80',
  ghost: 'hover:bg-accent/50 active:bg-accent/80 text-foreground',
};

export const MobileOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  MobileOptimizedButtonProps
>(
  (
    {
      size = 'default',
      variant = 'primary',
      haptic = true,
      isLoading = false,
      fullWidthMobile = false,
      isIconButton = false,
      iconType,
      className,
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const { light } = useHapticFeedback();
    const touchTargetClass = getTouchButtonClasses(size);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !isLoading && !disabled) {
        light();
      }
      onClick?.(e);
    };

    const responsiveClass = isIconButton
      ? RESPONSIVE_CLASSES.button.icon
      : size === 'tiny' || size === 'small'
        ? RESPONSIVE_CLASSES.button.compact
        : RESPONSIVE_CLASSES.button.touch;

    const baseClass = cn(
      // Touch target and responsiveness
      responsiveClass,
      
      // Touch target minimum
      touchTargetClass,
      
      // Styling
      variantStyles[variant],
      
      // Mobile-specific
      fullWidthMobile && 'w-full md:w-auto',
      
      // Common button styles
      'rounded-lg font-medium transition-all duration-200',
      'active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Loading state
      isLoading && 'opacity-70 pointer-events-none',
      
      className
    );

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        aria-label={iconType}
        className={baseClass}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

MobileOptimizedButton.displayName = 'MobileOptimizedButton';
