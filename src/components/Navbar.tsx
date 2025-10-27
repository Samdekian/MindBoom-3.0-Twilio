
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/useTheme';
import LanguageSwitcher from './LanguageSwitcher';
import NavbarLogo from './navbar/NavbarLogo';
import NavbarLinks from './navbar/NavbarLinks';
import EnhancedUserMenu from './navbar/EnhancedUserMenu';
import MobileMenu from './navbar/MobileMenu';
import AuthButtons from './navbar/AuthButtons';
import { RoleBadge } from '@/components/ui/role-badge';
import { Sun, MoonStar, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMigrationTracking } from '@/utils/migration/migration-helpers';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, userRoles, primaryRole } = useAuthRBAC();

  // Track migration
  useMigrationTracking('Navbar', 'useAuthRBAC');

  // Determine color scheme based on user roles
  const getNavbarScheme = () => {
    if (!user) return { border: 'border-t-blue-500', bg: 'bg-blue-50/30' };
    if (userRoles.includes('admin')) return { border: 'border-t-orange-500', bg: 'bg-orange-50/30' };
    if (userRoles.includes('therapist')) return { border: 'border-t-purple-500', bg: 'bg-purple-50/30' };
    return { border: 'border-t-blue-500', bg: 'bg-blue-50/30' };
  };

  const scheme = getNavbarScheme();

  return (
    <nav className={cn(
      "w-full py-3 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 fixed top-0 z-50 border-t-2 transition-colors",
      "bg-white/90 dark:bg-gray-900/90",
      scheme.border,
      user && scheme.bg
    )}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left section - Logo and Role Badge */}
          <div className="flex items-center space-x-3">
            <NavbarLogo />
            {user && primaryRole && (
              <RoleBadge role={primaryRole as 'admin' | 'therapist' | 'patient'} variant="compact" />
            )}
          </div>
          
          {/* Center section - Navigation Links (desktop) */}
          <div className="hidden lg:flex items-center">
            <NavbarLinks />
          </div>
          
          {/* Right section - Controls and User Menu */}
          <div className="flex items-center space-x-2">
            {/* Theme and Language (desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <LanguageSwitcher />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full"
                aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:block">
                  <EnhancedUserMenu />
                </div>
                
                {/* Prominent Logout Button (desktop) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="hidden md:flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:block">
                <AuthButtons />
              </div>
            )}
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
