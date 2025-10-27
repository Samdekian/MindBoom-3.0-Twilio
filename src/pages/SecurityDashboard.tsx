
import React from "react";
import { Helmet } from "react-helmet-async";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const SecurityDashboard = () => {
  const { user } = useAuthRBAC();

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Security Dashboard | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events and system status
          </p>
        </div>

        <div className="grid gap-4">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Security Overview</h3>
            <p className="text-muted-foreground">
              Security monitoring and alerts will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
