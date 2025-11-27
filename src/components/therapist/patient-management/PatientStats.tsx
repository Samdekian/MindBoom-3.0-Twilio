import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  UserX,
  Activity
} from "lucide-react";

interface PatientStatsProps {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  urgentPatients: number;
  sessionsThisWeek: number;
  upcomingSessions: number;
  overduePatients: number;
  averageSessionsPerPatient: number;
}

const PatientStats: React.FC<PatientStatsProps> = ({
  totalPatients,
  activePatients,
  inactivePatients,
  urgentPatients,
  sessionsThisWeek,
  upcomingSessions,
  overduePatients,
  averageSessionsPerPatient,
}) => {
  const activePercentage = totalPatients > 0 ? (activePatients / totalPatients) * 100 : 0;
  
  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      trend: null,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Patients",
      value: activePatients,
      icon: CheckCircle,
      trend: `${activePercentage.toFixed(1)}% of total`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Urgent Cases",
      value: urgentPatients,
      icon: AlertTriangle,
      trend: urgentPatients > 0 ? "Requires attention" : "All good",
      color: urgentPatients > 0 ? "text-red-600" : "text-green-600",
      bgColor: urgentPatients > 0 ? "bg-red-50" : "bg-green-50",
    },
    {
      title: "Sessions This Week",
      value: sessionsThisWeek,
      icon: Calendar,
      trend: null,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions,
      icon: Clock,
      trend: null,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Overdue Follow-ups",
      value: overduePatients,
      icon: UserX,
      trend: overduePatients > 0 ? "Need scheduling" : "Up to date",
      color: overduePatients > 0 ? "text-red-600" : "text-green-600",
      bgColor: overduePatients > 0 ? "bg-red-50" : "bg-green-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.value > 0 && stat.title === "Urgent Cases" && (
                      <Badge variant="destructive" className="text-xs">
                        !
                      </Badge>
                    )}
                  </div>
                  {stat.trend && (
                    <p className={`text-xs ${stat.color.replace('text-', 'text-')}`}>
                      {stat.trend}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PatientStats;