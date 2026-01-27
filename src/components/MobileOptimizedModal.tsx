/**
 * MobileOptimizedModal - Centralized modal component with mobile optimization
 * 
 * Features:
 * - Bottom sheet style on mobile
 * - Centered modal on desktop
 * - Keyboard-safe scrolling
 * - Safe area support
 * - Touch-friendly interactions
 * - Smooth animations
 * 
 * Usage:
 * <MobileOptimizedModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Modal Title"
 * >
 *   Modal content here
 * </MobileOptimizedModal>
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile, useScrollLock, useSafeAreaInsets } from '@/hooks/useMobileOptimized';
import { getModalDimensions, RESPONSIVE_CLASSES } from '@/utils/mobile';
import { X } from 'lucide-react';

interface MobileOptimizedModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show close button
   */
  showCloseButton?: boolean;

  /**
   * Close on overlay click
   */
  closeOnOverlayClick?: boolean;

  /**
   * Footer actions
   */
  footer?: React.ReactNode;

  /**
   * Custom className for modal content
   */
  className?: string;

  /**
   * Prevent scroll behind modal
   */
  lockScroll?: boolean;

  /**
   * Safe area padding
   */
  useSafeArea?: boolean;
}

const sizeClasses = {
  sm: 'md:max-w-md',
  md: 'md:max-w-xl',
  lg: 'md:max-w-2xl',
};

export const MobileOptimizedModal: React.FC<MobileOptimizedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className,
  lockScroll = true,
  useSafeArea = true,
}) => {
  const isMobile = useIsMobile();
  const safeArea = useSafeAreaInsets();
  const dimensions = getModalDimensions(isMobile);

  // Lock scroll when modal is open
  useScrollLock(isOpen && lockScroll);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContentClass = cn(
    // Base styling
    'bg-background rounded-lg shadow-xl',
    'flex flex-col max-h-[90vh]',
    
    // Mobile: bottom sheet style
    'md:rounded-lg',
    
    // Responsive sizing
    'w-full',
    !isMobile && sizeClasses[size],
    
    // Safe area support
    useSafeArea && 'pb-4',
    
    className
  );

  const overlayClass = cn(
    // Fixed overlay
    'fixed inset-0 bg-black/50',
    'flex items-center justify-center',
    
    // Mobile: align to bottom
    isMobile ? 'items-end md:items-center' : 'items-center',
    
    // Animation
    'transition-opacity duration-300 ease-out',
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  const containerStyle = isMobile
    ? {
        maxWidth: dimensions.maxWidth,
        maxHeight: dimensions.maxHeight,
        borderRadius: '16px 16px 0 0', // Bottom sheet style
      }
    : {
        maxWidth: dimensions.maxWidth,
        maxHeight: dimensions.maxHeight,
      };

  if (useSafeArea) {
    containerStyle.paddingBottom = `max(16px, calc(16px + ${safeArea.bottom}px))`;
  }

  return (
    <div
      className={overlayClass}
      onClick={handleOverlayClick}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        className={modalContentClass}
        style={containerStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between',
              RESPONSIVE_CLASSES.modal.container,
              'border-b border-border'
            )}
          >
            {title && (
              <h2
                id="modal-title"
                className={cn(RESPONSIVE_CLASSES.modal.title, 'font-semibold')}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'ml-auto p-2 rounded-lg',
                  'hover:bg-accent transition-colors',
                  'touch-target md:h-9 md:w-9'
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch"
        >
          <div
            className={cn(
              RESPONSIVE_CLASSES.modal.container,
              RESPONSIVE_CLASSES.modal.body
            )}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'border-t border-border',
              RESPONSIVE_CLASSES.modal.container,
              'flex gap-3 justify-end flex-col-reverse md:flex-row'
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

MobileOptimizedModal.displayName = 'MobileOptimizedModal';

// ============================================================================
// useModal Hook - For managing modal state
// ============================================================================

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = React.useState(initialState);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

// ============================================================================
// ModalTrigger Component - Wrapper for buttons that open modals
// ============================================================================

interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Handler to open modal
   */
  onClick: () => void;

  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
}

export const ModalTrigger = React.forwardRef<
  HTMLButtonElement,
  ModalTriggerProps
>(
  (
    {
      onClick,
      children,
      variant = 'primary',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input hover:bg-accent',
      ghost: 'hover:bg-accent text-foreground',
    };

    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-4 text-base',
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          // Touch target minimum
          'min-h-[44px] min-w-[44px]',
          
          // Base styles
          'rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Size
          sizeStyles[size],
          
          // Variant
          variantStyles[variant],
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ModalTrigger.displayName = 'ModalTrigger';
