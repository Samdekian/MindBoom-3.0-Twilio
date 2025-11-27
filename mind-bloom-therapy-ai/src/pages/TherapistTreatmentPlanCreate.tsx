
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target } from "lucide-react";
import { Helmet } from "react-helmet-async";
import AppLayout from "@/components/layout/AppLayout";
import TreatmentPlanForm from "@/components/therapist/treatment-plans/TreatmentPlanForm";

const TherapistTreatmentPlanCreate = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/therapist/patients');
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <Helmet>
          <title>Create Treatment Plan | Therapy Platform</title>
        </Helmet>
        
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/therapist/patients')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Create Treatment Plan</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Design evidence-based treatment plans with SMART goals and trackable milestones
          </p>
        </div>

        <TreatmentPlanForm onSuccess={handleSuccess} />
      </div>
    </AppLayout>
  );
};

export default TherapistTreatmentPlanCreate;
