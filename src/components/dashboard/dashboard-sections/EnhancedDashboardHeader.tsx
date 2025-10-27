
import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { RoleBadge } from "@/components/ui/role-badge";
import { 
  Calendar, 
  ChartLine, 
  Settings, 
  User, 
  Users, 
  BriefcaseMedical, 
  Activity, 
  Shield,
  Search
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

interface EnhancedDashboardHeaderProps {
  userType?: 'patient' | 'therapist' | 'admin' | 'auto';
  showQuickLinks?: boolean;
  showSearch?: boolean;
}

const EnhancedDashboardHeader: React.FC<EnhancedDashboardHeaderProps> = ({ 
  userType = 'auto',
  showQuickLinks = true,
  showSearch = false
}) => {
  const { user, loading, hasRole, primaryRole } = useAuthRBAC();
  const navigate = useNavigate();
  
  // Track migration
  useMigrationTracking('EnhancedDashboardHeader', 'useAuthRBAC');
  
  // Determine user type if set to auto
  let resolvedUserType = userType;
  if (userType === 'auto') {
    if (hasRole('admin')) {
      resolvedUserType = 'admin';
    } else if (hasRole('therapist')) {
      resolvedUserType = 'therapist';
    } else {
      resolvedUserType = 'patient';
    }
  }
  
  if (loading) {
    return <LoadingState variant="skeleton" className="mb-6" />;
  }

  // Role-specific header content
  const headerContent = {
    patient: {
      title: "Patient Dashboard",
      subtitle: "Manage your therapy journey and track your progress",
      quickLinks: [
        { label: "Book Session", icon: Calendar, href: "/book-therapist" },
        { label: "My Progress", icon: Activity, href: "/progress" },
        { label: "Profile", icon: User, href: "/profile" }
      ]
    },
    therapist: {
      title: "Therapist Dashboard",
      subtitle: "Manage your practice and support your patients",
      quickLinks: [
        { label: "Patients", icon: Users, href: "/therapist?tab=patients" },
        { label: "Schedule", icon: Calendar, href: "/calendar" },
        { label: "Availability", icon: BriefcaseMedical, href: "/therapist?tab=availability" }
      ]
    },
    admin: {
      title: "Admin Dashboard",
      subtitle: "System administration and platform management",
      quickLinks: [
        { label: "User Management", icon: Users, href: "/admin/users" },
        { label: "Analytics", icon: ChartLine, href: "/admin/analytics" },
        { label: "Security", icon: Shield, href: "/admin/security" }
      ]
    }
  };
  
  const currentUserContent = headerContent[resolvedUserType];

  return (
    <div className="mb-6 space-y-4">
      {/* Breadcrumb Navigation */}
      <DashboardBreadcrumb />
      
      {/* Header with Role Badge and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentUserContent.title}</h1>
            <p className="text-gray-600 mt-1">{currentUserContent.subtitle}</p>
          </div>
          {primaryRole && (
            <RoleBadge role={primaryRole as 'admin' | 'therapist' | 'patient'} />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-9 w-64"
              />
            </div>
          )}
          
          {/* Settings Button */}
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      {/* Quick Action Cards */}
      {showQuickLinks && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentUserContent.quickLinks.map((link) => (
            <Card 
              key={link.label} 
              className="cursor-pointer transition-colors hover:bg-gray-50 border"
              onClick={() => navigate(link.href)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <link.icon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{link.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboardHeader;
