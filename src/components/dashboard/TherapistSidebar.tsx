import React from 'react';
import { Calendar, Users, BarChart3, Clock, Stethoscope, Video, Home, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { ConnectionStatusIndicator } from '@/components/connection/ConnectionStatusIndicator';
import { cn } from '@/lib/utils';

interface TherapistSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isConnected?: boolean;
  isDegraded?: boolean;
}

const TherapistSidebar: React.FC<TherapistSidebarProps> = ({
  activeSection,
  setActiveSection,
  isConnected = true,
  isDegraded = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuthRBAC();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'treatment', label: 'Treatment Planning', icon: Stethoscope },
    { id: 'video-sessions', label: 'Video Sessions', icon: Video },
  ];

  return (
    <Sidebar className="border-r bg-white h-full flex flex-col">
      <SidebarHeader className="border-b flex-shrink-0">
        <div className="p-4 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Therapist Dashboard
            </h2>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                {user.user_metadata?.name || user.email}
              </p>
            )}
          </div>
          <ConnectionStatusIndicator 
            isConnected={isConnected} 
            isDegraded={isDegraded} 
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full justify-start gap-3 text-left transition-colors rounded-md",
                        isActive 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t flex-shrink-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={toggleTheme} 
                  className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarSeparator className="my-2" />
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={signOut}
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};

export default TherapistSidebar;
