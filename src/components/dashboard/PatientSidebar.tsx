import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  Activity, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  Heart,
  TrendingUp
} from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

interface PatientSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ activeSection, setActiveSection }) => {
  const { user, signOut } = useAuthRBAC();
  const navigate = useNavigate();

  // Track migration
  useMigrationTracking('PatientSidebar', 'useAuthRBAC');

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home, description: "Dashboard home" },
    { id: "appointments", label: "Appointments", icon: Calendar, description: "Manage sessions" },
    { id: "progress", label: "Progress", icon: TrendingUp, description: "Track your journey" },
    { id: "mood", label: "Mood Tracker", icon: Heart, description: "Daily mood check-in" },
    { id: "resources", label: "Resources", icon: BookOpen, description: "Helpful materials" },
    { id: "ai-chat", label: "AI Therapy", icon: MessageSquare, description: "Chat with AI assistant" },
  ];

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Patient";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Sidebar className="border-r border-blue-200/50 bg-white/70 backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
      <SidebarHeader className="border-b border-blue-200/30 dark:border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">TherapyHub</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Patient Portal</p>
            </div>
          </div>
          <SidebarTrigger className="h-6 w-6" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className={`w-full justify-start group transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'hover:bg-blue-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${
                      activeSection === item.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-200/30 dark:border-gray-700/50 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
            <RoleBadge role="patient" variant="compact" />
          </div>
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default PatientSidebar;
