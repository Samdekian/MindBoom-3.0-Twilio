
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useRBAC } from "@/hooks/useRBAC";

interface SecurityAuditButtonProps {
  showIcon?: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm";
}

export const SecurityAuditButton: React.FC<SecurityAuditButtonProps> = ({
  showIcon = true,
  variant = "outline",
  size = "default"
}) => {
  const { hasRole, loading } = useRBAC();
  const canViewAudit = hasRole('therapist') || hasRole('admin');
  
  if (loading) {
    return null;
  }
  
  if (!canViewAudit) {
    return null;
  }
  
  return (
    <Button 
      variant={variant}
      size={size}
      asChild
    >
      <Link to="/security-audit" className="flex items-center">
        {showIcon && <Shield className="h-4 w-4 mr-2" />}
        Security Audit
      </Link>
    </Button>
  );
};
