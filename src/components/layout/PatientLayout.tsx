import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import { User, Calendar, Shield, Moon, Sun, LogOut, Home, BookOpen, MessageSquare, FileText, Clock, Globe } from "lucide-react";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import MobileHeader from "@/components/patient/MobileHeader";
import MobileBottomNav from "@/components/patient/MobileBottomNav";
import MobileDrawer from "@/components/patient/MobileDrawer";

interface PatientLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PatientLayout = ({ children, title, description }: PatientLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuthRBAC();
  const { patientInquiries } = usePatientInquiries();
  const { theme, toggleTheme } = useTheme();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Track migration
  useMigrationTracking('PatientLayout', 'useAuthRBAC');

  const unreadResponses = patientInquiries.filter(i => i.status === 'responded').length;

  const navItems = [
    { path: "/patient", label: "Dashboard", icon: Home },
    { path: "/patient/book", label: "Book Session", icon: Calendar },
    { path: "/patient/inquiries", label: "My Inquiries", icon: MessageSquare, badge: unreadResponses },
    { path: "/patient/treatment-plans", label: "Treatment Plans", icon: FileText },
    { path: "/patient/history", label: "Session History", icon: Clock },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/appointments", label: "Appointments", icon: BookOpen },
  ];

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Patient";
  const userEmail = user?.email || "";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title ? `${title} | Therapy Platform` : 'Patient Dashboard | Therapy Platform'}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      
      {/* Mobile Header - visible only on mobile */}
      <div className="lg:hidden">
        <MobileHeader onMenuClick={() => setIsMobileDrawerOpen(true)} />
      </div>
      
      {/* Desktop Top Navigation - hidden on mobile */}
      <nav className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Logo */}
            <div className="flex items-center">
              <Link to="/patient" className="flex items-center space-x-2">
                <span className="font-bold text-2xl gradient-text">MindBloom</span>
              </Link>
            </div>
            
            {/* Right - Controls */}
            <div className="flex items-center space-x-4">
              {/* Language/Globe Icon */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-9 w-9"
              >
                <Globe className="h-4 w-4" />
              </Button>
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full h-9 w-9"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {/* User Initial Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
                    <span className="text-sm font-medium text-gray-700">
                      {userInitials}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white">
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 w-fit">
                        Patient
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="py-2">
                    <p className="px-2 py-1 text-xs font-medium text-gray-600">Navigation</p>
                    
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard" className="flex items-center space-x-2 px-2 py-2">
                        <Home className="h-4 w-4" />
                        <span>Main Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {navItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild className="cursor-pointer">
                        <Link to={item.path} className="flex items-center space-x-2 px-2 py-2">
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && item.badge > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="py-2">
                    <p className="px-2 py-1 text-xs font-medium text-gray-600">Account</p>
                    
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center space-x-2 px-2 py-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/security-settings" className="flex items-center space-x-2 px-2 py-2">
                        <Shield className="h-4 w-4" />
                        <span>Security</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={toggleTheme}
                    className="cursor-pointer flex items-center space-x-2 px-2 py-2"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>Dark Mode</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="cursor-pointer flex items-center space-x-2 px-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:py-6 lg:pb-6">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation - visible only on mobile */}
      <MobileBottomNav onMoreClick={() => setIsMobileDrawerOpen(true)} />
      
      {/* Mobile Drawer Menu */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </div>
  );
};

export default PatientLayout;
