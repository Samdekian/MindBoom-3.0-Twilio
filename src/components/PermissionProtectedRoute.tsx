
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { ComponentPermission } from "@/utils/rbac/component-types";
import { adaptComponentPermissions } from "@/utils/rbac/permission-adapter";

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  permissions: ComponentPermission[];
  redirectPath?: string;
  requireAll?: boolean;
  layoutClassName?: string;
  silent?: boolean;
}

/**
 * A route component that restricts access based on permissions
 * Works with the unified AuthRBACContext
 */
const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  permissions,
  redirectPath = "/dashboard",
  requireAll = false,
  layoutClassName = "min-h-screen flex items-center justify-center",
  silent = false,
  ...rest
}) => {
  const { 
    user, 
    loading, 
    checkPermissions,
    isAdmin 
  } = useAuthRBAC();
  const { toast } = useToast();
  const location = useLocation();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('PermissionProtectedRoute');
      console.log('Path:', location.pathname);
      console.log('Permissions:', permissions);
      console.log('Auth loading:', loading);
      console.groupEnd();
    }
  }, [location.pathname, permissions, loading]);
  
  // Show loading state while checking auth or permissions
  if (loading) {
    return (
      <LoadingState
        variant="spinner"
        text="Checking permissions..."
        size="md"
        className="min-h-[200px]"
      />
    );
  }

  // Redirect to login if no user
  if (!user) {
    // Show toast only once when redirecting (if not silent)
    if (!silent) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
    }
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Admins always have access to everything
  if (isAdmin) {
    return <div {...rest}>{children}</div>;
  }

  // Check for permission-based access
  const hasPermissionAccess = checkPermissions(adaptComponentPermissions(permissions), { 
    requireAll
  });

  // For authenticated users, either redirect or render children based on access check
  if (!hasPermissionAccess) {
    if (!silent) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // Show the protected content
  return <div {...rest}>{children}</div>;
};

export default PermissionProtectedRoute;
