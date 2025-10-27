import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Target, Clock, TrendingUp } from "lucide-react";
import { usePatientDashboardStats } from "@/hooks/use-patient-dashboard-stats";

const QuickStatsBar = () => {
  const { data: stats, isLoading } = usePatientDashboardStats();

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const quickStats = [
    {
      label: "Sessions",
      value: stats.totalSessions,
      subtext: "completed",
      icon: CalendarDays,
      color: "bg-blue-100 text-blue-700"
    },
    {
      label: "Goals",
      value: `${stats.completedGoals}/${stats.totalGoals}`,
      subtext: "achieved",
      icon: Target,
      color: "bg-green-100 text-green-700"
    },
    {
      label: "Progress",
      value: `${Math.round(stats.treatmentPlanProgress)}%`,
      subtext: "complete",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-700"
    },
    {
      label: "Streak",
      value: `${stats.streakDays}d`,
      subtext: "current",
      icon: Clock,
      color: "bg-orange-100 text-orange-700"
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 flex-1 min-w-0">
              <Badge variant="secondary" className={`${stat.color} h-10 w-10 rounded-full flex items-center justify-center p-0`}>
                <stat.icon className="h-4 w-4" />
              </Badge>
              <div className="min-w-0">
                <div className="text-lg font-semibold">{stat.value}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {stat.label} {stat.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStatsBar;