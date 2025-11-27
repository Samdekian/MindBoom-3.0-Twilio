import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { usePatientTreatmentPlans, usePatientGoals } from "@/hooks/use-patient-treatment-plans";
import { formatDistanceToNow, format } from "date-fns";

const PatientTreatmentPlansPage = () => {
  const { data: treatmentPlans, isLoading: plansLoading } = usePatientTreatmentPlans();
  const { data: goals, isLoading: goalsLoading } = usePatientGoals();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "active": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "active":
      case "in_progress": return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (plansLoading || goalsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Treatment Plans</h1>
        <p className="text-muted-foreground">Your personalized therapy journey and goals</p>
      </div>

      {treatmentPlans && treatmentPlans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatment Plans */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Active Treatment Plans
            </h2>
            {treatmentPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {plan.therapist_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started {formatDistanceToNow(new Date(plan.start_date), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span>{Math.round(plan.progress_percentage)}%</span>
                    </div>
                    <Progress value={plan.progress_percentage} className="h-2" />
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Treatment Goals</h4>
                    <ul className="space-y-1 text-sm">
                      {plan.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.end_date && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Expected completion: {format(new Date(plan.end_date), "MMM dd, yyyy")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Goals */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Goals
            </h2>
            {goals && goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(goal.status)}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(goal.status)}>
                          {goal.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {goal.target_date && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Target: {format(new Date(goal.target_date), "MMM dd, yyyy")}
                        </div>
                      )}

                      {goal.progress_notes && (
                        <div className="bg-muted p-2 rounded text-xs mt-2">
                          <span className="font-medium">Progress: </span>
                          {goal.progress_notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No goals set yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Treatment Plan Yet</h3>
            <p className="text-muted-foreground mb-4">
              Your therapist will create a personalized treatment plan after your initial consultation.
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">Getting Started</p>
                  <p className="text-muted-foreground">
                    Book your first session to begin developing your treatment plan and therapy goals.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientTreatmentPlansPage;