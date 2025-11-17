
import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import PatientSidebar from "@/components/patient/PatientSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeSection from "@/components/patient/WelcomeSection";
import UpcomingAppointments from "@/components/patient/UpcomingAppointments";
import QuickActions from "@/components/patient/QuickActions";
import QuickStatsBar from "@/components/patient/QuickStatsBar";
import ResourcesWidget from "@/components/dashboard/ResourcesWidget";
import PatientGoalsWidget from "@/components/patient/PatientGoalsWidget";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import MobileHeader from "@/components/patient/MobileHeader";
import MobileBottomNav from "@/components/patient/MobileBottomNav";
import MobileDrawer from "@/components/patient/MobileDrawer";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import { useRealTimeUpdates } from "@/hooks/use-realtime-updates";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingWelcomeBanner } from "@/components/patient/onboarding/OnboardingWelcomeBanner";
import { OnboardingFlow } from "@/components/patient/onboarding/OnboardingFlow";

const PatientDashboardContent = () => {
  const { user } = useAuthRBAC();
  const { state } = useOnboarding();
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Track migration
  useMigrationTracking('PatientDashboard', 'useAuthRBAC');
  
  // Initialize real-time updates (simplified)
  useRealTimeUpdates(user?.id || '');

  const handleOpenOnboardingFlow = () => {
    setShowOnboardingFlow(true);
  };

  const handleCloseOnboardingFlow = () => {
    setShowOnboardingFlow(false);
  };

  const handleOpenMobileDrawer = () => {
    setIsMobileDrawerOpen(true);
  };

  const handleCloseMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <PatientSidebar />
        </div>
        
        {/* Mobile Header - visible only on mobile */}
        <div className="lg:hidden w-full">
          <MobileHeader onMenuClick={handleOpenMobileDrawer} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 pb-20 lg:p-6 lg:pb-6 space-y-4 lg:space-y-6 max-w-7xl mx-auto">
            {/* Desktop Header - hidden on mobile */}
            <div className="hidden lg:block">
              <DashboardHeader />
            </div>
            
            {/* Show onboarding banner if not complete */}
            {!state.isOnboardingComplete ? (
              <OnboardingWelcomeBanner onOpenOnboardingFlow={handleOpenOnboardingFlow} />
            ) : (
              <WelcomeSection />
            )}
            
            <QuickStatsBar />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <UpcomingAppointments />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <PatientGoalsWidget />
              </div>
              <div>
                <ResourcesWidget />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <LiveActivityFeed />
              </div>
              <div>
                {/* Future: Additional real-time widgets */}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation - visible only on mobile */}
      <MobileBottomNav onMoreClick={handleOpenMobileDrawer} />
      
      {/* Mobile Drawer Menu */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={handleCloseMobileDrawer}
      />
      
      {/* Onboarding Flow Modal */}
      <OnboardingFlow 
        isOpen={showOnboardingFlow} 
        onClose={handleCloseOnboardingFlow} 
      />
    </SidebarProvider>
  );
};

const PatientDashboard = () => {
  return (
    <OnboardingProvider>
      <PatientDashboardContent />
    </OnboardingProvider>
  );
};

export default PatientDashboard;
