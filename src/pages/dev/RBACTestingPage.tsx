
import React from "react";
import { Helmet } from "react-helmet-async";
import RBACTestingDashboard from "@/components/rbac-testing/RBACTestingDashboard";

const RBACTestingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>RBAC Testing | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">RBAC Testing</h1>
          <p className="text-muted-foreground">
            Test role-based access control functionality
          </p>
        </div>
        
        <RBACTestingDashboard />
      </div>
    </div>
  );
};

export default RBACTestingPage;
