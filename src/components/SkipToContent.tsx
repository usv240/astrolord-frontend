import { memo } from 'react';

/**
 * SkipToContent - Accessibility component for keyboard navigation
 * 
 * Features:
 * - Hidden by default, visible on focus
 * - Allows keyboard users to skip navigation
 * - High contrast for visibility
 */
export const SkipToContent = memo(() => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2 focus:rounded-lg
        focus:bg-primary focus:text-primary-foreground
        focus:shadow-lg focus:ring-2 focus:ring-primary/50
        focus:outline-none
        transition-all duration-200
        text-sm font-medium
      "
    >
      Skip to main content
    </a>
  );
});

SkipToContent.displayName = 'SkipToContent';

export default SkipToContent;

