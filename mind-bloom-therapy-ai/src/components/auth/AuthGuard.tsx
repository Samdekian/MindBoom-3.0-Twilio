import { useEffect } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireRole?: string;
}

export function AuthGuard({ 
  children, 
  redirectTo = '/auth', 
  requireRole 
}: AuthGuardProps) {
  const { isAuthenticated, isInitialized, hasRole, loading } = useAuthRBAC();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || loading) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this feature.",
        variant: "destructive",
      });
      navigate(redirectTo);
      return;
    }

    if (requireRole && !hasRole(requireRole)) {
      toast({
        title: "Access Denied",
        description: `You need ${requireRole} privileges to access this feature.`,
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [isAuthenticated, isInitialized, loading, requireRole, hasRole, redirectTo, navigate, toast]);

  // Show loading while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render children if role is required but not met
  if (requireRole && !hasRole(requireRole)) {
    return null;
  }

  return <>{children}</>;
}