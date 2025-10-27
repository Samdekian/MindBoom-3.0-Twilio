
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserRoleRepair from "@/components/admin/UserRoleRepair";

const AdminRoleRepairPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Role Management</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Consistency Management</CardTitle>
            <CardDescription>
              Tools to ensure users have proper role assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This utility helps repair inconsistencies between user profiles and their role assignments.
              It's particularly useful after registrations or when roles are modified outside the normal workflow.
            </p>
            <UserRoleRepair />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRoleRepairPage;
