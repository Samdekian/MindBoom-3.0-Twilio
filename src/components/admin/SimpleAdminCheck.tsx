
import React, { useEffect, useState } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface SimpleAdminCheckProps {
  children: React.ReactNode;
}

const SimpleAdminCheck: React.FC<SimpleAdminCheckProps> = ({ children }) => {
  const { user } = useAuthRBAC();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Use the existing admin check function that bypasses RLS
        const { data, error } = await supabase
          .rpc('is_admin_bypass_rls', { check_user_id: user.id });

        if (error) {
          console.error('Admin check error:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error('Admin check exception:', err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Checking admin access...</p>
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

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Administrator access required. For testing, the first registered user has admin access.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default SimpleAdminCheck;
