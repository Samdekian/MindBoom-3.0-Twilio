
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Edit, Plus } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const RoleManagementPage = () => {
  const { user } = useAuthRBAC();

  // Mock role data
  const roles = [
    {
      id: "1",
      name: "Admin",
      description: "Full system access and management",
      userCount: 3,
      permissions: ["read", "write", "delete", "manage_users", "system_settings"]
    },
    {
      id: "2",
      name: "Therapist",
      description: "Access to patient data and session management",
      userCount: 45,
      permissions: ["read", "write", "manage_patients", "session_management"]
    },
    {
      id: "3",
      name: "Patient",
      description: "Access to personal data and sessions",
      userCount: 234,
      permissions: ["read", "update_profile", "book_sessions"]
    },
    {
      id: "4",
      name: "Support",
      description: "Customer support and basic system access",
      userCount: 8,
      permissions: ["read", "customer_support", "basic_reports"]
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Role Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        <div className="grid gap-6">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {role.userCount} users
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
