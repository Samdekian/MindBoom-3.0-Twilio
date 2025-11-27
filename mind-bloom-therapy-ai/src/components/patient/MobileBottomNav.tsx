import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Video, MessageCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMoreClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/patient',
      color: 'text-blue-600'
    },
    {
      id: 'book',
      label: 'Book',
      icon: Calendar,
      path: '/patient/book',
      color: 'text-green-600'
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: Video,
      path: '/patient/history',
      color: 'text-purple-600'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/patient/inquiries',
      color: 'text-orange-600'
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      path: null,
      color: 'text-gray-600'
    }
  ];

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/patient') {
      return location.pathname === '/patient';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'more') {
      onMoreClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg",
                "active:scale-95 transform"
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 mb-1 transition-all duration-200",
                  active ? item.color : "text-gray-400",
                  active && "scale-110"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  active ? item.color : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

