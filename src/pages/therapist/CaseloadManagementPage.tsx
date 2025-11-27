
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import AppLayout from "@/components/layout/AppLayout";
import CaseloadOverviewTab from "@/components/therapist/caseload/CaseloadOverviewTab";
import WorkloadMetricsTab from "@/components/therapist/caseload/WorkloadMetricsTab";
import PatientAssignmentsTab from "@/components/therapist/caseload/PatientAssignmentsTab";
import CaseloadConfigurationTab from "@/components/therapist/caseload/CaseloadConfigurationTab";

const CaseloadManagementPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Helmet>
          <title>Caseload Management | Therapy Platform</title>
        </Helmet>

        <div>
          <h1 className="text-3xl font-bold">Caseload Management</h1>
          <p className="text-gray-600">Manage your patient capacity, workload, and assignments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Workload Metrics</TabsTrigger>
            <TabsTrigger value="assignments">Patient Assignments</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CaseloadOverviewTab />
          </TabsContent>

          <TabsContent value="metrics">
            <WorkloadMetricsTab />
          </TabsContent>

          <TabsContent value="assignments">
            <PatientAssignmentsTab />
          </TabsContent>

          <TabsContent value="configuration">
            <CaseloadConfigurationTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CaseloadManagementPage;
