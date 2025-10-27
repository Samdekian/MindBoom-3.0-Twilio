
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/ui/role-badge';

const TherapistMobileHeader: React.FC = () => {
  const { user, primaryRole } = useAuthRBAC();
  
  const userName = user?.user_metadata?.name || user?.email || 'Therapist';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Therapist Dashboard
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {primaryRole && (
            <RoleBadge role={primaryRole as 'admin' | 'therapist' | 'patient'} variant="compact" />
          )}
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TherapistMobileHeader;
