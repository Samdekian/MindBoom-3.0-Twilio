
// Component implementation
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserRoleTable from "./UserRoleTable";
import RoleChangeHistory from "../auth/RoleChangeHistory";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { asUserRoles } from "@/utils/rbac/type-adapters";
import { UserRole } from "@/types/core/rbac";

const EnhancedRoleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { listRoles, error: roleError } = useRoleManagement();

  // Fetch available roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await listRoles();
        // Convert string array to UserRole array
        setAvailableRoles(asUserRoles(roles));
      } catch (err) {
        setError("Failed to load available roles");
        console.error("Error fetching roles:", err);
      }
    };

    fetchRoles();
  }, [listRoles]);

  // Merge errors from hook and component
  const displayError = error || roleError;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="history">Role Change History</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserRoleTable />
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Role Change History</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleChangeHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRoleManagement;
