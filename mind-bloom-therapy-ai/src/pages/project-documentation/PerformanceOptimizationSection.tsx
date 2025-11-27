
import React from "react";
import PerformanceOptimization from "@/components/project-documentation/performance/PerformanceOptimization";
import RoleBasedGuard from "@/components/RoleBasedGuard";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PerformanceOptimizationSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="mb-12">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Optimization (Phase 4)</h2>
          <p className="text-muted-foreground mt-1">
            Tracking and improving application performance metrics
          </p>
        </div>
        
        <RoleBasedGuard allowedRoles={['admin']}>
          <Button
            onClick={() => navigate('/performance')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Performance Dashboard
          </Button>
        </RoleBasedGuard>
      </div>
      
      <PerformanceOptimization />

      <RoleBasedGuard allowedRoles={['admin']}>
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Admin Controls</h3>
          <p className="mb-4">As an admin user, you have access to detailed performance metrics and optimization tools.</p>
          <Button
            onClick={() => navigate('/performance')}
            variant="default"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Go to Performance Dashboard
          </Button>
        </div>
      </RoleBasedGuard>
    </section>
  );
};

export default PerformanceOptimizationSection;
