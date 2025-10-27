import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, UserRound, Bell } from "lucide-react";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DashboardHeader = () => {
  const { user } = useAuthRBAC();

  // Track migration
  useMigrationTracking('TherapistDashboardHeader', 'useAuthRBAC');

  // Fetch real dashboard statistics
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['therapist-dashboard-real-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get patient count
      const { data: patientAssignments, error: patientsError } = await supabase
        .from('patient_assignments')
        .select('patient_id')
        .eq('therapist_id', user.id)
        .eq('status', 'active');
      if (patientsError) throw patientsError;

      // Get today's sessions
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      const { data: todaySessions, error: todayError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('therapist_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .in('status', ['scheduled', 'confirmed'])
        .order('start_time', { ascending: true });
      if (todayError) throw todayError;

      // Get upcoming sessions (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data: upcomingSessions, error: upcomingError } = await supabase
        .from('appointments')
        .select('id')
        .eq('therapist_id', user.id)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', nextWeek.toISOString())
        .in('status', ['scheduled', 'confirmed']);
      if (upcomingError) throw upcomingError;

      // Get unread notifications/inquiries
      const { data: notifications, error: notificationsError } = await supabase
        .from('patient_inquiries')
        .select('id')
        .eq('therapist_id', user.id)
        .eq('status', 'pending');
      if (notificationsError) throw notificationsError;

      // Calculate next session time
      const nextSessionTime = todaySessions?.[0]
        ? new Date(todaySessions[0].start_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        : null;

      return {
        patientCount: patientAssignments?.length || 0,
        todaySessionCount: todaySessions?.length || 0,
        nextSessionTime,
        weekSessionCount: upcomingSessions?.length || 0,
        notificationCount: notifications?.length || 0
      };
    },
    enabled: !!user?.id,
    refetchInterval: 5 * 60 * 1000
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
          <UserRound className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : dashboardStats?.patientCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">Total active patients</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : dashboardStats?.todaySessionCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {dashboardStats?.nextSessionTime
              ? `Next at ${dashboardStats.nextSessionTime}`
              : "No sessions scheduled today"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : dashboardStats?.weekSessionCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">Next 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : dashboardStats?.notificationCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHeader;
