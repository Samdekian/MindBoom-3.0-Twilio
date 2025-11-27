
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, CheckCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from "@/components/ui/loading-state";

export interface GoalProgressTrackerProps {
  planId?: string;
}

const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({ planId }) => {
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['treatment-goals', planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from('treatment_goals')
        .select('*')
        .eq('treatment_plan_id', planId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treatment goals:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!planId,
  });

  if (isLoading) {
    return <LoadingState variant="spinner" text="Loading goals..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load treatment goals</p>
        </CardContent>
      </Card>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Goal Progress Tracking</h3>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No treatment goals found for this plan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Goal Progress Tracking ({goals.length})</h3>
      </div>
      
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription className="mt-1">
                  {goal.description || 'No description provided'}
                </CardDescription>
                {goal.target_date && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={goal.status === 'completed' ? 'default' : 
                             goal.status === 'in_progress' ? 'secondary' : 'outline'}>
                  {goal.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {goal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{goal.progress_percentage || 0}%</span>
              </div>
              <Progress value={goal.progress_percentage || 0} className="w-full" />
              {goal.status === 'completed' && (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Goal completed
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GoalProgressTracker;
