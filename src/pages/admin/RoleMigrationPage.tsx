import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/AdminLayout';
import RoleMigrationUtility from '@/components/admin/RoleMigrationUtility';
import RoleConsistencyDashboard from '@/components/admin/RoleConsistencyDashboard';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const RoleMigrationPage: React.FC = () => {
  const { isAdmin } = useAuthRBAC();
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Role Migration Utility | Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Migration</h1>
          <p className="text-muted-foreground">
            Manage and migrate user roles across the system
          </p>
        </div>
        
        <Separator />
        
        <div className="grid gap-6">
          <RoleMigrationUtility />
          <RoleConsistencyDashboard />
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoleMigrationPage;
