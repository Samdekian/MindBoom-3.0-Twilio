
import React, { useEffect, useState } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TherapistSidebar from "@/components/dashboard/TherapistSidebar";
import TherapistMainContent from "@/components/dashboard/TherapistMainContent";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import { useSimplifiedRealtime } from "@/hooks/useSimplifiedRealtime";

/**
 * TherapistDashboard Component
 * 
 * A clean, professional dashboard for therapists with patient management and practice oversight.
 */
const TherapistDashboard = () => {
  const { user, loading, isAdmin, isTherapist, isAuthenticated } = useAuthRBAC();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Track migration
  useMigrationTracking('TherapistDashboard', 'useAuthRBAC');

  // Add connection monitoring with delayed initialization
  const { isConnected, isDegraded, error } = useSimplifiedRealtime('therapist-dashboard', {
    enabled: isAuthenticated && !loading,
    gracefulDegradation: true,
  });

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[TherapistDashboard] No authenticated user, will redirect to login");
      return;
    }

    // Check if user has therapist access
    if (!isTherapist && !isAdmin) {
      console.log("[TherapistDashboard] User doesn't have therapist access, redirecting");
      toast({
        title: "Access Restricted",
        description: "This dashboard is only available to therapists.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    toast({
      title: "Welcome",
      description: "Ready to help your patients today."
    });
    
    // Quick loading for better UX
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading, isTherapist, isAdmin, isAuthenticated, toast, navigate]);

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

  // Check access - therapists and admins only
  if (!isTherapist && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout
      sidebar={
        <TherapistSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isConnected={isConnected}
          isDegraded={isDegraded}
        />
      }
    >
      <TherapistMainContent 
        activeSection={activeSection} 
        isPageLoading={isPageLoading} 
      />
    </DashboardLayout>
  );
};

export default TherapistDashboard;
