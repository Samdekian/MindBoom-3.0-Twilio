
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import TherapistApprovalTable from "@/components/admin/TherapistApprovalTable";

const TherapistApprovalPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Therapist Approvals | Admin Dashboard</title>
        </Helmet>
        
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Therapist Approvals</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Review and approve therapist applications
          </p>
        </div>

        <TherapistApprovalTable />
      </div>
    </AppLayout>
  );
};

export default TherapistApprovalPage;
