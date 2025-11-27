
import React from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const HeaderSection: React.FC = () => {
  const { roles, loading } = useRBAC();
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive overview of MindBloom&apos;s development progress and implementation status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Your roles:</span>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : roles.length > 0 ? (
            <div className="flex gap-2">
              {roles.map(role => (
                <Badge key={role} variant={role === "admin" ? "default" : "outline"}>
                  {role}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No special roles</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
