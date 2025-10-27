
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import AppLayout from "@/components/layout/AppLayout";
import PatientGroupsTab from "@/components/therapist/patient-management/PatientGroupsTab";
import PatientTagsTab from "@/components/therapist/patient-management/PatientTagsTab";
import AdvancedSearchTab from "@/components/therapist/patient-management/AdvancedSearchTab";

const PatientManagementPage = () => {
  const [activeTab, setActiveTab] = useState("groups");

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Helmet>
          <title>Patient Management | Therapy Platform</title>
        </Helmet>

        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-gray-600">Organize and manage your patient caseload with groups, tags, and advanced search</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="groups">Patient Groups</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <PatientGroupsTab />
          </TabsContent>

          <TabsContent value="tags">
            <PatientTagsTab />
          </TabsContent>

          <TabsContent value="search">
            <AdvancedSearchTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PatientManagementPage;
