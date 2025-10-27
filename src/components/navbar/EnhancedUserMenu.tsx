
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  LogOut, 
  Calendar, 
  ShieldCheck,
  Stethoscope,
  UserCircle,
  ChevronDown
} from "lucide-react";
import { PROTECTED_PATHS } from "@/routes/routePaths";

const EnhancedUserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthRBAC();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(PROTECTED_PATHS.DASHBOARD);
  };

  const avatarName = user?.user_metadata?.name as string || user?.email as string || "User";
  const avatarSrc = user?.user_metadata?.avatar_url as string;

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 lg:h-10 lg:w-10 rounded-full">
          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={avatarName} />
            ) : (
              <AvatarFallback>{avatarName?.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate(PROTECTED_PATHS.DASHBOARD)}>
          <User className="h-4 w-4 mr-2" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(PROTECTED_PATHS.PROFILE)}>
          <UserCircle className="h-4 w-4 mr-2" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(PROTECTED_PATHS.SECURITY_SETTINGS)}>
          <ShieldCheck className="h-4 w-4 mr-2" />
          <span>Security</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(PROTECTED_PATHS.APPOINTMENTS)}>
          <Calendar className="h-4 w-4 mr-2" />
          <span>Appointments</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedUserMenu;
