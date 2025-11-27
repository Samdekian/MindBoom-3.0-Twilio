
import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Button } from "@/components/ui/button";
import { Calendar, ChartLine, Settings, User, Users, BriefcaseMedical, Activity, Shield } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

interface DashboardHeaderProps {
  userType?: 'patient' | 'therapist' | 'admin' | 'auto';
  showQuickLinks?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userType = 'auto',
  showQuickLinks = true
}) => {
  const { user, loading, hasRole } = useAuthRBAC();
  const navigate = useNavigate();
  
  // Track migration
  useMigrationTracking('DashboardHeader', 'useAuthRBAC');
  
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
      quickLinks: [
        { label: "Calendar", icon: Calendar, href: "/calendar" },
        { label: "Progress", icon: Activity, href: "/progress" },
        { label: "Profile", icon: User, href: "/profile" }
      ]
    },
    therapist: {
      title: "Therapist Dashboard",
      quickLinks: [
        { label: "Patients", icon: Users, href: "/patients" },
        { label: "Calendar", icon: Calendar, href: "/calendar" },
        { label: "Treatment Plans", icon: BriefcaseMedical, href: "/treatment-plans" }
      ]
    },
    admin: {
      title: "Admin Dashboard",
      quickLinks: [
        { label: "Users", icon: Users, href: "/admin/users" },
        { label: "Analytics", icon: ChartLine, href: "/admin/analytics" },
        { label: "Security", icon: Shield, href: "/admin/security" }
      ]
    }
  };
  
  const currentUserContent = headerContent[resolvedUserType];

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">{currentUserContent.title}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      
      {showQuickLinks && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {currentUserContent.quickLinks.map((link) => (
            <Card 
              key={link.label} 
              className="p-3 flex flex-col items-center justify-center hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigate(link.href)}
            >
              <link.icon className="h-5 w-5 mb-1" />
              <span className="text-xs text-center">{link.label}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
