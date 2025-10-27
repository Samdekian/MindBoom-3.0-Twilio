
import React from "react";
import RBACMonitoringDashboard from "@/components/admin/RBACMonitoringDashboard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const RBACAdminDashboard = () => {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">RBAC Administration</h1>
          <p className="text-muted-foreground">
            Monitor, manage and troubleshoot role-based access control
          </p>
        </div>
        
        <div>
          <Button asChild variant="outline">
            <a href="/admin">Back to Admin Dashboard</a>
          </Button>
        </div>
      </div>
      
      <RBACMonitoringDashboard />
    </div>
  );
};

export default RBACAdminDashboard;
