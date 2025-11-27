
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useTheme } from '@/hooks/useTheme';
import { useRBAC } from '@/hooks/useRBAC';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserInitials } from './user-menu/UserInitials';
import UserInfo from './user-menu/UserInfo';
import MenuItems from './user-menu/MenuItems';
import LogoutButton from './user-menu/LogoutButton';

const UserMenu = () => {
  const { user, signOut } = useAuthRBAC();
  const { theme, toggleTheme } = useTheme();
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="rounded-full h-8 w-8 p-0"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 bg-therapy-purple text-white">
            <AvatarFallback>
              <UserInitials user={user} />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <UserInfo user={user} />
        <DropdownMenuSeparator />
        <MenuItems 
          onThemeToggle={toggleTheme}
          theme={theme}
          isAdmin={isAdmin}
        />
        <DropdownMenuSeparator />
        <LogoutButton onLogout={signOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
