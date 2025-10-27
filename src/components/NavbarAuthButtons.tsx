
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { AUTH_PATHS, PROTECTED_PATHS, ADMIN_PATHS } from "@/routes/routePaths";
import { cn } from "@/lib/utils";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

import { LogIn, LogOut, Settings, User, UserCog, Shield } from "lucide-react";

export const NavbarAuthButtons = () => {
  const { user, signOut } = useAuthRBAC();
  
  // Track migration
  useMigrationTracking('NavbarAuthButtons', 'useAuthRBAC');
  
  // Style classes for different route types
  const routeTypeStyles = {
    'public': 'border-l-blue-500',
    'protected': 'border-l-purple-500',
    'auth': 'border-l-gray-500',
    'admin': 'border-l-orange-500',
  };
  
  if (!user) {
    // Not logged in
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={AUTH_PATHS.LOGIN}>
            <LogIn className="mr-2 h-4 w-4" />
            Log in
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to={AUTH_PATHS.REGISTER}>Sign up</Link>
        </Button>
      </div>
    );
  }

  // User is logged in - show dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative" size="sm">
          <User className="h-4 w-4 mr-2" />
          {user.email ? (
            <span className="hidden md:inline-block">{user.email}</span>
          ) : (
            <span className="hidden md:inline-block">My Account</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={PROTECTED_PATHS.PROFILE} className={cn(
              "flex items-center border-l-2 pl-3",
              routeTypeStyles.protected
            )}>
              <UserCog className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/settings" className={cn(
              "flex items-center border-l-2 pl-3",
              routeTypeStyles.protected
            )}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          
          {/* Always show Admin Dashboard link for logged-in users */}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={ADMIN_PATHS.DASHBOARD} className={cn(
              "flex items-center border-l-2 pl-3",
              routeTypeStyles.admin
            )}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
