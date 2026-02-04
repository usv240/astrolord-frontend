import { memo } from 'react';
import { Home, MessageSquare, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'relationship', label: 'Match', icon: Heart },
];

export const MobileBottomNav = memo(({ activeTab, onTabChange }: MobileBottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 flex justify-around items-center py-2 px-4 lg:hidden z-50 safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-lg transition-all duration-200 min-w-[70px] relative',
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                isActive && 'scale-110'
              )}
            />
            <span className={cn(
              'text-[11px] font-medium transition-all duration-200',
              isActive && 'font-semibold'
            )}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;
