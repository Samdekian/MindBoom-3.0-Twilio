
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const TherapistPatientManagement = () => {
  const { user } = useAuthRBAC();

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Patient Management | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage your patients and their treatment progress
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Overview</CardTitle>
            <CardDescription>View and manage your patient caseload</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Patient management features will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TherapistPatientManagement;
