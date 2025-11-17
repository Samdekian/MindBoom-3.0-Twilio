import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, TrendingUp } from "lucide-react";
import { usePatientGoals } from "@/hooks/use-patient-goals";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { GoalsSetupWizard } from "./onboarding/GoalsSetupWizard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";

const PatientGoalsWidget = () => {
  const { user } = useAuthRBAC();
  const { state } = useOnboarding();
  const { activeGoals, completedGoals, isLoading, updateGoalProgress } = usePatientGoals(user?.id || '');
  const [showGoalsSetup, setShowGoalsSetup] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <CardTitle>Goals</CardTitle>
          </div>
          <CardDescription>Track your therapy progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <CardTitle>Goals</CardTitle>
          </div>
          <CardDescription>Track your therapy progress</CardDescription>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 mr-1" />
          {completedGoals.length} completed
        </div>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="text-center py-6">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {!state.isOnboardingComplete ? (
              <>
                <p className="text-sm text-muted-foreground">Set Your First Goals</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Define what you want to achieve in therapy
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setShowGoalsSetup(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Set Your Goals
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No active goals yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your therapist will help you set goals during your sessions
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{goal.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {goal.progress_percentage}%
                  </span>
                </div>
                <Progress value={goal.progress_percentage} className="h-2" />
                {goal.target_date && (
                  <p className="text-xs text-muted-foreground">
                    Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          View All Goals
        </Button>
      </CardFooter>
      
      {/* Goals Setup Modal */}
      <Dialog open={showGoalsSetup} onOpenChange={setShowGoalsSetup}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>Goals Setup</DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          <GoalsSetupWizard />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatientGoalsWidget;