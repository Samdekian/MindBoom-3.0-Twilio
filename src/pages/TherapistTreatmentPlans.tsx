
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, BarChart3 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import TreatmentPlansList from "@/components/therapist/treatment-plans/TreatmentPlansList";
import GoalProgressTracker from "@/components/therapist/treatment-plans/GoalProgressTracker";

const TherapistTreatmentPlans = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'progress'>('list');

  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('progress');
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/therapist/treatment-plan/edit/${planId}`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Treatment Plans | Therapy Platform</title>
        </Helmet>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Treatment Plans</h1>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'progress' && (
              <Button
                variant="outline"
                onClick={() => {
                  setViewMode('list');
                  setSelectedPlanId(null);
                }}
              >
                Back to Plans
              </Button>
            )}
            <Button onClick={() => navigate('/therapist/treatment-plan/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Treatment Plan
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <TreatmentPlansList 
            onViewPlan={handleViewPlan}
            onEditPlan={handleEditPlan}
          />
        ) : selectedPlanId ? (
          <GoalProgressTracker planId={selectedPlanId} />
        ) : null}
      </div>
    </AppLayout>
  );
};

export default TherapistTreatmentPlans;
