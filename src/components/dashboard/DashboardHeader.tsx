import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, BarChart3, BookOpen } from "lucide-react";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import RealTimeStatus from "./RealTimeStatus";
const DashboardHeader = () => {
  const {
    user
  } = useAuthRBAC();
  const {
    t
  } = useLanguage();

  // Track migration
  useMigrationTracking('DashboardHeader', 'useAuthRBAC');

  // Get the name from user metadata or use email as fallback
  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || "Patient";

  // Get current time to display appropriate greeting
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon";
  } else if (hour >= 18) {
    greeting = "Good evening";
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{greeting}, {name}</h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your wellness journey
          </p>
        </div>
        <RealTimeStatus />
      </div>
      
      
    </div>;
};
export default DashboardHeader;