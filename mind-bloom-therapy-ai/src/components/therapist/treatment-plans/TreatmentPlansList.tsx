
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Calendar, User } from "lucide-react";
import { useTreatmentPlans } from "@/hooks/use-treatment-plans";
import { LoadingState } from "@/components/ui/loading-state";

export interface TreatmentPlansListProps {
  patientId?: string;
  onViewPlan?: (planId: string) => void;
  onEditPlan?: (planId: string) => void;
}

const TreatmentPlansList: React.FC<TreatmentPlansListProps> = ({ patientId, onViewPlan, onEditPlan }) => {
  const { treatmentPlans, isLoading, error } = useTreatmentPlans(patientId);

  if (isLoading) {
    return <LoadingState variant="spinner" text="Loading treatment plans..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load treatment plans</p>
        </CardContent>
      </Card>
    );
  }

  if (!treatmentPlans || treatmentPlans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No treatment plans found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {treatmentPlans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                    {plan.status}
                  </Badge>
                </div>
                <CardDescription className="mb-2">
                  {plan.description || 'No description provided'}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {plan.start_date ? new Date(plan.start_date).toLocaleDateString() : 'No start date'}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Priority: {plan.priority || 'medium'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {onViewPlan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewPlan(plan.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                {onEditPlan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPlan(plan.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default TreatmentPlansList;
