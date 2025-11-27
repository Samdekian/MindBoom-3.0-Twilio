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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse p-3 rounded-lg bg-muted/50">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickStats.map((stat, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <Badge 
                variant="secondary" 
                className={`${stat.color} h-12 w-12 rounded-full flex items-center justify-center p-0 shrink-0`}
              >
                <stat.icon className="h-5 w-5" />
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="text-base md:text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
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