
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useRBAC } from '@/hooks/useRBAC';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { User, Shield, Sun, MoonStar, Calendar, Settings, Home, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROTECTED_PATHS, ADMIN_PATHS } from '@/routes/routePaths';

interface MenuItemsProps {
  onThemeToggle: () => void;
  theme: string;
  isAdmin?: boolean;
}

const MenuItems = ({ onThemeToggle, theme, isAdmin }: MenuItemsProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { hasRole } = useRBAC();
  const isTherapist = hasRole('therapist');

  // Menu items with visual indicators
  const menuItems = [
    {
      label: t("profile"),
      icon: User,
      action: () => navigate(PROTECTED_PATHS.PROFILE),
      routeType: 'protected'
    },
    {
      label: t("calendar"),
      icon: Calendar,
      action: () => navigate(PROTECTED_PATHS.CALENDAR),
      routeType: 'protected'
    },
    {
      label: t("security"),
      icon: Shield,
      action: () => navigate(PROTECTED_PATHS.SECURITY_SETTINGS),
      routeType: 'protected'
    }
  ];

  // Therapist-only items
  const therapistItems = isTherapist ? [
    {
      label: t("dashboard") + " (" + t("therapist") + ")",
      icon: Home,
      action: () => navigate(PROTECTED_PATHS.THERAPIST_DASHBOARD),
      routeType: 'protected'
    }
  ] : [];

  // Admin-only items
  const adminItems = [
    {
      label: t("admin_portal"),
      icon: Settings,
      action: () => navigate(ADMIN_PATHS.DASHBOARD),
      routeType: 'admin'
    },
    {
      label: t("security_dashboard"),
      icon: Shield,
      action: () => navigate(ADMIN_PATHS.SECURITY_DASHBOARD),
      routeType: 'admin'
    }
  ];

  // Style classes for different route types
  const routeTypeStyles = {
    'public': 'border-l-blue-500',
    'protected': 'border-l-purple-500',
    'auth': 'border-l-gray-500',
    'admin': 'border-l-orange-500',
  };

  return (
    <>
      {menuItems.map((item) => (
        <DropdownMenuItem 
          key={item.label}
          onClick={item.action} 
          className={cn(
            "cursor-pointer border-l-2 pl-3",
            routeTypeStyles[item.routeType]
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.label}</span>
        </DropdownMenuItem>
      ))}
      
      {therapistItems.map((item) => (
        <DropdownMenuItem 
          key={item.label}
          onClick={item.action} 
          className={cn(
            "cursor-pointer border-l-2 pl-3",
            routeTypeStyles[item.routeType]
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.label}</span>
        </DropdownMenuItem>
      ))}
      
      <DropdownMenuItem onClick={onThemeToggle} className="cursor-pointer">
        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <MoonStar className="mr-2 h-4 w-4" />}
        <span>{theme === 'dark' ? t("lightMode") : t("darkMode")}</span>
      </DropdownMenuItem>
      
      {isAdmin && adminItems.map((item) => (
        <DropdownMenuItem 
          key={item.label}
          onClick={item.action} 
          className={cn(
            "cursor-pointer border-l-2 pl-3",
            routeTypeStyles[item.routeType]
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.label}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
};

export default MenuItems;
