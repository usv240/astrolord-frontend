/**
 * Centralized Mobile Utilities & Configuration
 * Single source of truth for all mobile experience optimizations
 * 
 * Usage:
 * - import { MOBILE_BREAKPOINTS, getMobileClasses } from '@/utils/mobile'
 */

// ============================================================================
// BREAKPOINTS - Centralized definition
// ============================================================================
export const MOBILE_BREAKPOINTS = {
  xs: 375,    // iPhone SE, small phones
  sm: 425,    // Small phones
  md: 768,    // Tablets, iPad
  lg: 1024,   // Large tablets, small laptops
  xl: 1280,   // Desktop
  '2xl': 1536, // Large desktop
} as const;

export type Breakpoint = keyof typeof MOBILE_BREAKPOINTS;

// ============================================================================
// TOUCH TARGETS - WCAG 2.5 guidelines (minimum 44px)
// ============================================================================
export const TOUCH_TARGETS = {
  tiny: 'h-8 w-8 min-h-[32px] min-w-[32px]',      // 32px - smallest
  small: 'h-10 w-10 min-h-[40px] min-w-[40px]',    // 40px - icon buttons
  default: 'h-11 w-auto min-h-[44px] min-w-[44px]', // 44px - WCAG AA
  large: 'h-12 w-auto min-h-[48px] min-w-[48px]',   // 48px - easier to tap
} as const;

// ============================================================================
// SPACING - Mobile-optimized padding & margins
// ============================================================================
export const MOBILE_SPACING = {
  xs: 'p-2 gap-2',              // 8px
  sm: 'p-3 gap-3',              // 12px
  md: 'p-4 gap-4',              // 16px
  lg: 'p-5 gap-5',              // 20px
  xl: 'p-6 gap-6',              // 24px
} as const;

// ============================================================================
// RESPONSIVE CLASSES - Mobile-first approach
// ============================================================================
export const RESPONSIVE_CLASSES = {
  // Button classes for different screen sizes
  button: {
    touch: 'h-11 px-4 text-sm md:h-10 md:px-3',           // Mobile: 44px, Desktop: 40px
    icon: 'h-10 w-10 min-h-[44px] min-w-[44px] md:h-9',   // Mobile: 44px, Desktop: 36px
    compact: 'h-9 px-3 text-xs md:h-8',                    // Mobile: 36px, Desktop: 32px
  },

  // Modal/Dialog for mobile
  modal: {
    container: 'p-4 md:p-6 lg:p-8',                        // Mobile: 16px, Tablet: 24px, Desktop: 32px
    title: 'text-lg md:text-xl lg:text-2xl',              // Mobile: 18px, Desktop: 20px
    body: 'text-sm md:text-base',                          // Mobile: 14px, Desktop: 16px
  },

  // Form inputs for mobile keyboards
  input: {
    field: 'h-10 px-3 text-sm md:h-9 md:px-3',           // Mobile: 40px, Desktop: 36px
    textarea: 'min-h-[100px] p-3 text-sm md:p-2',        // Mobile-friendly vertical space
    label: 'text-sm md:text-xs font-medium',              // Mobile: 14px, Desktop: 12px
  },

  // Navigation for touch
  nav: {
    item: 'h-12 px-4 md:h-10 md:px-3',                   // Mobile: 48px, Desktop: 40px
    icon: 'h-12 w-12 min-h-[44px] min-w-[44px] md:h-10', // Mobile: 48px, Desktop: 40px
  },

  // Cards and containers
  card: {
    padding: 'p-3 md:p-4 lg:p-6',                         // Mobile: 12px, Tablet: 16px, Desktop: 24px
    gap: 'gap-2 md:gap-3 lg:gap-4',                       // Mobile: 8px, Tablet: 12px, Desktop: 16px
  },

  // Grid layouts
  grid: {
    mobile: 'grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4',
    auto: 'grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },

  // Flex layouts
  flex: {
    stack: 'flex-col gap-2 md:flex-row md:gap-3 lg:gap-4',
    wrap: 'flex-wrap gap-2 md:gap-3',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get responsive Tailwind classes based on context
 * @param context - The UI component context (button, modal, input, nav, etc.)
 * @param size - Optional size variant (touch, icon, compact, etc.)
 * @returns Tailwind class string
 */
export function getMobileClasses(
  context: 'button' | 'modal' | 'input' | 'nav' | 'card' | 'grid' | 'flex',
  size?: string
): string {
  const contextClasses = RESPONSIVE_CLASSES[context];
  if (!contextClasses) return '';
  
  if (size && size in contextClasses) {
    return contextClasses[size as keyof typeof contextClasses] as string;
  }
  
  // Return first available variant if no size specified
  return Object.values(contextClasses)[0] as string;
}

/**
 * Get button classes with proper touch target sizing
 * @param size - 'tiny' | 'small' | 'default' | 'large'
 * @returns Tailwind class string
 */
export function getTouchButtonClasses(size: keyof typeof TOUCH_TARGETS = 'default'): string {
  return TOUCH_TARGETS[size];
}

/**
 * Get spacing classes for mobile optimization
 * @param size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @returns Tailwind class string
 */
export function getMobileSpacingClasses(size: keyof typeof MOBILE_SPACING = 'md'): string {
  return MOBILE_SPACING[size];
}

/**
 * Convert breakpoint value to media query
 * @param breakpoint - Breakpoint name or custom pixel value
 * @returns Media query string
 */
export function getMediaQuery(breakpoint: Breakpoint | number): string {
  const px = typeof breakpoint === 'string' ? MOBILE_BREAKPOINTS[breakpoint] : breakpoint;
  return `(max-width: ${px - 1}px)`;
}

/**
 * Get safe area insets for notched devices
 * Useful for iOS devices with notches/Dynamic Island
 * @returns CSS object with safe area insets
 */
export function getSafeAreaInsets(): Record<string, string> {
  return {
    paddingTop: 'max(1rem, env(safe-area-inset-top))',
    paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
    paddingLeft: 'max(1rem, env(safe-area-inset-left))',
    paddingRight: 'max(1rem, env(safe-area-inset-right))',
  };
}

/**
 * Calculate optimal font size for mobile
 * @param desktopSize - Font size in px for desktop
 * @param isMobile - Is current screen mobile
 * @returns Font size in px
 */
export function getResponsiveFontSize(desktopSize: number, isMobile: boolean): number {
  if (!isMobile) return desktopSize;
  // Reduce font size slightly for mobile to save space
  return Math.max(12, Math.floor(desktopSize * 0.9));
}

/**
 * Get modal dimensions optimized for current viewport
 * @param isMobile - Is current screen mobile
 * @returns Modal width and height recommendations
 */
export function getModalDimensions(isMobile: boolean): Record<string, string> {
  if (isMobile) {
    return {
      width: '95vw',          // 95% of viewport width
      maxWidth: '425px',      // Max width for small phones
      maxHeight: '90vh',      // 90% of viewport height (leave room for keyboard)
    };
  }
  return {
    width: '90vw',
    maxWidth: '600px',
    maxHeight: '80vh',
  };
}

/**
 * Get safe bottom position accounting for keyboard on mobile
 * @param isMobile - Is current screen mobile
 * @param hasKeyboard - Is virtual keyboard visible
 * @returns Bottom spacing in px
 */
export function getSafeBottomSpacing(isMobile: boolean, hasKeyboard: boolean = false): number {
  if (!isMobile) return 0;
  // On mobile with keyboard, use extra space to prevent overlap
  return hasKeyboard ? 250 : 0;
}

/**
 * Combine multiple mobile class strings
 * @param classes - Tailwind class strings to combine
 * @returns Combined class string
 */
export function combineMobileClasses(...classes: (string | undefined | null)[]): string {
  return classes
    .filter((c) => typeof c === 'string')
    .join(' ')
    .trim();
}

// ============================================================================
// EXPORT PRESET CONFIGURATIONS
// ============================================================================

/**
 * Pre-made configurations for common components
 */
export const MOBILE_PRESETS = {
  // Button presets
  primaryButton: combineMobileClasses(
    RESPONSIVE_CLASSES.button.touch,
    'rounded-lg font-medium transition-colors'
  ),
  
  iconButton: combineMobileClasses(
    RESPONSIVE_CLASSES.button.icon,
    'rounded-full transition-colors hover:bg-accent'
  ),
  
  // Form presets
  formField: combineMobileClasses(
    RESPONSIVE_CLASSES.input.field,
    'rounded-md border border-input bg-background px-3 transition-colors'
  ),
  
  formLabel: combineMobileClasses(
    RESPONSIVE_CLASSES.input.label,
    'block mb-2 font-medium text-foreground'
  ),
  
  // Modal presets
  modalOverlay: 'fixed inset-0 bg-black/50 flex items-center justify-center',
  
  modalContent: combineMobileClasses(
    RESPONSIVE_CLASSES.modal.container,
    'bg-background rounded-lg shadow-lg max-h-[90vh] overflow-y-auto'
  ),
  
  // Navigation presets
  navItem: combineMobileClasses(
    RESPONSIVE_CLASSES.nav.item,
    'flex items-center justify-center transition-colors hover:bg-accent'
  ),
  
  // Card presets
  card: combineMobileClasses(
    RESPONSIVE_CLASSES.card.padding,
    'rounded-lg border border-border bg-card hover:shadow-md transition-shadow'
  ),
} as const;

export type MobilePreset = keyof typeof MOBILE_PRESETS;
