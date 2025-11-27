
import React, { useEffect, useState } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck: React.FC<AdminAuthCheckProps> = ({ children }) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the new bypass function to check admin status
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin_bypass_rls', { check_user_id: user.id });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setError(`Failed to verify admin status: ${adminError.message}`);
        setIsAdmin(false);
        return;
      }

      console.log('Admin check result:', adminCheck);
      setIsAdmin(!!adminCheck);

      if (!adminCheck) {
        setError('You do not have administrator privileges. Please contact your system administrator.');
      }

    } catch (err: any) {
      console.error('Exception in admin check:', err);
      setError(`System error: ${err.message || 'Unknown error'}`);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const retryCheck = () => {
    checkAdminStatus();
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Verifying admin privileges...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You must be logged in to access the admin dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Check Failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={retryCheck}>
            Retry Check
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isAdmin === false) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have administrator privileges required to access this dashboard.
          Please contact your system administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  // User is confirmed admin, render the admin dashboard
  return <>{children}</>;
};

export default AdminAuthCheck;
