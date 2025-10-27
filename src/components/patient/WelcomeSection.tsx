
import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import { usePatientDashboardStats } from "@/hooks/use-patient-dashboard-stats";

const WelcomeSection = () => {
  const { user } = useAuthRBAC();
  const { data: stats } = usePatientDashboardStats();
  
  // Track migration
  useMigrationTracking('PatientWelcomeSection', 'useAuthRBAC');
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {getGreeting()}, {user?.email?.split('@')[0] || 'Patient'}!
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Welcome to your mental health journey
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Patient Dashboard
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Track your progress, schedule appointments, and access resources for your wellbeing.
          </p>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.nextAppointment && (
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">Next Session</p>
                    <p className="text-xs text-gray-600 truncate">
                      {stats.nextAppointment.date} at {stats.nextAppointment.time}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      with {stats.nextAppointment.therapistName}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Progress</p>
                  <p className="text-xs text-gray-600">
                    {stats.totalSessions} sessions completed
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(stats.treatmentPlanProgress)}% treatment progress
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Activity</p>
                  <p className="text-xs text-gray-600">
                    {stats.sessionsThisMonth} sessions this month
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.streakDays} day streak
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
