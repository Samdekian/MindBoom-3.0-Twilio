
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useRBAC } from "@/hooks/useRBAC";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import EnhancedRoleManagement from "@/components/admin/EnhancedRoleManagement";
import RoleTroubleshooter from "@/components/auth/RoleTroubleshooter";
import RoleTroubleshootingGuide from "@/components/auth/RoleTroubleshootingGuide";
import RoleDetailsPanel from "@/components/admin/RoleDetailsPanel";
import PermissionMatrix from "@/components/admin/PermissionMatrix";
import RoleHistoryTimeline from "@/components/auth/RoleHistoryTimeline";
import PermissionManager from "@/components/admin/PermissionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ShieldAlert, Shield, Settings } from "lucide-react";

const RoleManagementCenter: React.FC = () => {
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');
  const [activeTab, setActiveTab] = useState("management");
  
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'therapist', 'patient', 'support']}>
      <Layout>
        <Helmet>
          <title>Role Management Center | MindBloom</title>
        </Helmet>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <ShieldAlert className="h-6 w-6 mr-2" /> Role Management Center
              </h1>
              <p className="text-muted-foreground">
                Manage roles and permissions across the platform
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              {isAdmin && (
                <Button asChild variant="outline">
                  <a href="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Back to Admin
                  </a>
                </Button>
              )}
              <Button asChild>
                <a href="/dashboard">Back to Dashboard</a>
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {isAdmin ? (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-6 w-full md:w-[800px]">
                <TabsTrigger value="management">Role Management</TabsTrigger>
                <TabsTrigger value="details">Role Details</TabsTrigger>
                <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
                <TabsTrigger value="permissionManager">Advanced Permissions</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="troubleshoot">Troubleshooter</TabsTrigger>
              </TabsList>
              
              <TabsContent value="management" className="space-y-6">
                <EnhancedRoleManagement />
              </TabsContent>
              
              <TabsContent value="details" className="space-y-6">
                <RoleDetailsPanel />
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-6">
                <PermissionMatrix />
              </TabsContent>
              
              <TabsContent value="permissionManager" className="space-y-6">
                <PermissionManager />
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                <RoleHistoryTimeline />
              </TabsContent>
              
              <TabsContent value="troubleshoot" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <RoleTroubleshooter />
                  <RoleTroubleshootingGuide />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoleTroubleshooter />
              <RoleTroubleshootingGuide />
            </div>
          )}
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
};

export default RoleManagementCenter;
