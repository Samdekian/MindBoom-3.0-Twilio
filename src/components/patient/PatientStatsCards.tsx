import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Activity
} from "lucide-react";
import { usePatientDashboardStats } from "@/hooks/use-patient-dashboard-stats";

const PatientStatsCards = () => {
  const { data: stats, isLoading } = usePatientDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Sessions completed"
    },
    {
      title: "This Month",
      value: stats.sessionsThisMonth,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Sessions this month"
    },
    {
      title: "Goals Progress",
      value: `${stats.completedGoals}/${stats.totalGoals}`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Goals achieved",
      progress: (stats.completedGoals / stats.totalGoals) * 100
    },
    {
      title: "Treatment Progress",
      value: `${Math.round(stats.treatmentPlanProgress)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Overall progress",
      progress: stats.treatmentPlanProgress
    },
    {
      title: "Current Streak",
      value: `${stats.streakDays} days`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Consistency streak"
    },
    {
      title: "Last Session",
      value: stats.daysSinceLastSession === 0 ? "Today" : `${stats.daysSinceLastSession} days ago`,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      description: "Most recent session"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              {card.progress !== undefined && (
                <div className="space-y-1">
                  <Progress value={card.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(card.progress)}% complete
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientStatsCards;