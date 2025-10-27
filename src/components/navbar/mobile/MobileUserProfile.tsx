
import { Link } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Shield, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMigrationTracking } from '@/utils/migration/migration-helpers';

const MobileUserProfile = () => {
  const { user, signOut } = useAuthRBAC();
  const { t } = useLanguage();

  // Track migration
  useMigrationTracking('MobileUserProfile', 'useAuthRBAC');

  if (!user) return null;

  const getUserInitials = () => {
    if (!user.user_metadata?.name) return '?';
    const nameParts = user.user_metadata.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <>
      <div className="flex items-center space-x-2 mb-2">
        <Avatar className="h-8 w-8 bg-therapy-purple text-white">
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.user_metadata?.name || user.email}</span>
      </div>
      
      <Link to="/profile" className="flex items-center space-x-2 pl-2">
        <User size={16} />
        <span>{t("profile")}</span>
      </Link>
      
      <Link to="/security-settings" className="flex items-center space-x-2 pl-2">
        <Shield size={16} />
        <span>{t("security")}</span>
      </Link>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center space-x-2 mt-2 text-red-500 border-red-200 hover:bg-red-50"
        onClick={() => signOut()}
      >
        <LogOut size={16} />
        <span>{t("logout")}</span>
      </Button>
    </>
  );
};

export default MobileUserProfile;
