import React from 'react';
import { X, FileText, Clock, MessageSquare, BookOpen, Settings, HelpCircle, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { usePatientInquiries } from '@/hooks/use-patient-inquiries';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthRBAC();
  const { patientInquiries } = usePatientInquiries();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Patient";
  const userEmail = user?.email || "";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const unreadResponses = patientInquiries.filter(i => i.status === 'responded').length;

  const navigationItems = [
    {
      id: 'treatment-plans',
      label: 'Treatment Plans',
      icon: FileText,
      path: '/patient/treatment-plans',
      badge: null
    },
    {
      id: 'history',
      label: 'Session History',
      icon: Clock,
      path: '/patient/history',
      badge: null
    },
    {
      id: 'inquiries',
      label: 'My Inquiries',
      icon: MessageSquare,
      path: '/patient/inquiries',
      badge: unreadResponses
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BookOpen,
      path: '/patient/resources',
      badge: null
    }
  ];

  const settingsItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: User,
      path: '/profile'
    },
    {
      id: 'settings',
      label: 'App Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigation drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-100 active:bg-gray-200"
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] rounded-full px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Settings Items */}
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-100 active:bg-gray-200"
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer - Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default MobileDrawer;

