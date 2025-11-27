
import React, { useState, useEffect } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Navigate, useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EnhancedDashboardHeader from "@/components/dashboard/dashboard-sections/EnhancedDashboardHeader";
import DashboardTabs from "@/components/dashboard/dashboard-sections/DashboardTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import { getRoleBasedDashboard } from "@/utils/routing/unified-route-config";

const Dashboard = () => {
  const { user, loading, isTherapist, isAdmin, isAuthenticated, primaryRole } = useAuthRBAC();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const isMobile = useIsMobile();

  // Track migration
  useMigrationTracking('Dashboard', 'useAuthRBAC');

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      return;
    }

    // Role-based redirects using React Router
    if (primaryRole && primaryRole !== 'patient') {
      const correctDashboard = getRoleBasedDashboard(primaryRole);
      console.log(`[Dashboard] Redirecting ${primaryRole} to ${correctDashboard}`);
      navigate(correctDashboard, { replace: true });
      return;
    }

    // Welcome message for patients
    if (primaryRole === 'patient') {
      toast({
        title: "Welcome back!",
        description: "Ready to continue your therapy journey?"
      });
    }

    // Quick loading simulation
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [user, loading, isAuthenticated, primaryRole, toast, navigate]);

  if (loading) {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text="Loading dashboard..." 
        fullscreen={true}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while redirecting non-patients
  if (primaryRole && primaryRole !== 'patient') {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text="Redirecting to your dashboard..." 
        fullscreen={true}
      />
    );
  }

  if (isPageLoading) {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text="Setting up your dashboard..." 
        fullscreen={true}
      />
    );
  }

  return (
    <DashboardLayout showNavbar={true}>
      <div className="content-container">
        <EnhancedDashboardHeader 
          userType="patient"
          showQuickLinks={true}
          showSearch={false}
        />
        
        <DashboardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isTherapist={isTherapist}
          isAdmin={isAdmin}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
