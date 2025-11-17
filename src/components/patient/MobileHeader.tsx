import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { usePatientInquiries } from '@/hooks/use-patient-inquiries';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthRBAC();
  const { patientInquiries } = usePatientInquiries();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Patient";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const unreadResponses = patientInquiries.filter(i => i.status === 'responded').length;

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Center: Logo/Title */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MB</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">MindBloom</h1>
        </div>

        {/* Right: Notifications and Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadResponses > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadResponses}
              </Badge>
            )}
          </Button>

          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;

