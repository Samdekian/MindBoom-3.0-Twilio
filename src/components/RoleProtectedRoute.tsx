
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/core/rbac";
import { LoadingState } from "@/components/ui/loading-state";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
  requireAll?: boolean;
  silent?: boolean;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  allowedRoles = [],
  redirectPath = "/login",
  requireAll = false,
  silent = false,
  ...rest
}) => {
  const { user, loading, hasAnyRole, hasAllRoles, roles } = useAuthRBAC();
  const { toast } = useToast();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <LoadingState
        variant="spinner"
        text="Verifying permissions..."
        size="md"
        className="min-h-[200px]"
      />
    );
  }

  // Redirect to login if no user
  if (!user) {
    if (!silent) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
    }
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role requirements
  if (allowedRoles.length > 0) {
    const hasAccess = requireAll 
      ? hasAllRoles(allowedRoles)
      : hasAnyRole(allowedRoles);

    if (!hasAccess) {
      if (!silent) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
      }
      
      // Redirect based on user's actual role
      if (roles.includes('admin')) {
        return <Navigate to="/admin" replace />;
      } else if (roles.includes('therapist')) {
        return <Navigate to="/therapist" replace />;
      } else if (roles.includes('patient')) {
        return <Navigate to="/patient" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <div {...rest}>{children}</div>;
};

export default RoleProtectedRoute;
