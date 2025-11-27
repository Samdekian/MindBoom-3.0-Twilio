import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface AnalyticsData {
  totalRevenue: number;
  newCustomers: number;
  totalSessions: number;
  revenueTrend: { date: string; revenue: number }[];
}

export const useAnalyticsDashboard = () => {
  const { user } = useAuthRBAC();

  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analyticsDashboard", user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }

      // Calculate date ranges
      const today = new Date();
      const firstDayOfMonth = startOfMonth(today);
      const lastDayOfMonth = endOfMonth(today);

      // Fetch total revenue for the current month
      const { data: monthlyRevenueData, error: monthlyRevenueError } = await supabase
        .from("payments")
        .select("amount")
        .eq("therapist_id", user.id)
        .gte("created_at", format(firstDayOfMonth, "yyyy-MM-dd"))
        .lte("created_at", format(lastDayOfMonth, "yyyy-MM-dd"));

      if (monthlyRevenueError) {
        throw monthlyRevenueError;
      }

      const totalRevenue = monthlyRevenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Fetch new customers for the current month
      const { data: newCustomersData, error: newCustomersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("account_type", "patient")
        .eq("therapist_id", user.id)
        .gte("created_at", format(firstDayOfMonth, "yyyy-MM-dd"))
        .lte("created_at", format(lastDayOfMonth, "yyyy-MM-dd"));

      if (newCustomersError) {
        throw newCustomersError;
      }

      const newCustomers = newCustomersData?.length || 0;

      // Fetch total sessions for the current month
      const { data: totalSessionsData, error: totalSessionsError } = await supabase
        .from("appointments")
        .select("id")
        .eq("therapist_id", user.id)
        .gte("start_time", format(firstDayOfMonth, "yyyy-MM-dd"))
        .lte("start_time", format(lastDayOfMonth, "yyyy-MM-dd"));

      if (totalSessionsError) {
        throw totalSessionsError;
      }

      const totalSessions = totalSessionsData?.length || 0;

      // Fetch revenue trend for the last 6 months
      const revenueTrend: { date: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const pastMonthStart = startOfMonth(subMonths(today, i));
        const pastMonthEnd = endOfMonth(subMonths(today, i));

        const { data: pastRevenueData, error: pastRevenueError } = await supabase
          .from("payments")
          .select("amount")
          .eq("therapist_id", user.id)
          .gte("created_at", format(pastMonthStart, "yyyy-MM-dd"))
          .lte("created_at", format(pastMonthEnd, "yyyy-MM-dd"));

        if (pastRevenueError) {
          console.error("Error fetching past revenue data:", pastRevenueError);
          continue; // Skip this month if there's an error
        }

        const monthlyRevenue = pastRevenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        revenueTrend.push({
          date: format(pastMonthStart, "MMM yy"),
          revenue: monthlyRevenue,
        });
      }

      return {
        totalRevenue,
        newCustomers,
        totalSessions,
        revenueTrend,
      };
    },
    enabled: !!user?.id,
  });

  return { analyticsData, isLoading, error };
};
