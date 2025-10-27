
import React from "react";
import { LoadingState } from "@/components/ui/loading-state";
import TherapistOverview from "@/components/therapist-dashboard/TherapistOverview";
import TherapistAnalytics from "@/components/therapist-dashboard/TherapistAnalytics";
import TherapistAvailability from "@/components/therapist-dashboard/TherapistAvailability";
import CalendarView from "@/components/therapist-dashboard/CalendarView";
import TreatmentPlanningSection from "@/components/therapist-dashboard/TreatmentPlanningSection";
import VideoSessionTools from "@/components/therapist-dashboard/VideoSessionTools";
import EnhancedInquiryInbox from "@/components/inquiries/EnhancedInquiryInbox";

interface TherapistMainContentProps {
  activeSection: string;
  isPageLoading: boolean;
}

const TherapistMainContent: React.FC<TherapistMainContentProps> = ({
  activeSection,
  isPageLoading
}) => {
  const mainRef = React.useRef<HTMLDivElement>(null);

  // Reset scroll position when component mounts or section changes
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  if (isPageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingState 
          variant="spinner" 
          size="lg" 
          text="Loading dashboard..." 
        />
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <TherapistOverview />;
      case "inquiries":
        return <EnhancedInquiryInbox />;
      case "analytics":
        return <TherapistAnalytics />;
      case "availability":
        return <TherapistAvailability />;
      case "calendar":
        return <CalendarView />;
      case "treatment":
        return <TreatmentPlanningSection />;
      case "video-sessions":
        return <VideoSessionTools />;
      default:
        return <TherapistOverview />;
    }
  };

  return (
    <div ref={mainRef} className="flex-1 overflow-y-auto bg-gray-50 h-full">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default TherapistMainContent;
