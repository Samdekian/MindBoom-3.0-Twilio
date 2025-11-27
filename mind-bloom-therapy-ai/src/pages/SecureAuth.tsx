import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureAuthForm } from '@/components/auth/SecureAuthForm';
import BaseLayout from '@/components/layout/BaseLayout';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getRoleBasedDashboard } from '@/utils/routing/unified-route-config';
import { useAuthOperations } from '@/hooks/useAuthOperations';

const SecureAuth: React.FC = () => {
  const navigate = useNavigate();
  const { primaryRole, isAuthenticated } = useAuthRBAC();
  const { signIn, signUp } = useAuthOperations();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && primaryRole) {
      const redirectPath = getRoleBasedDashboard(primaryRole);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, primaryRole, navigate]);

  // Don't show auth form if already authenticated
  if (isAuthenticated) {
    return (
      <BaseLayout variant="auth" className="bg-gradient-to-br from-primary/10 to-primary-foreground/10">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-lg font-semibold">Already signed in</div>
          <div className="text-muted-foreground">Redirecting to your dashboard...</div>
        </div>
      </BaseLayout>
    );
  }

  const handleSignIn = async (email: string, password: string): Promise<{ error?: any }> => {
    try {
      const result = await signIn(email, password);
      if (!result.error) {
        // Success will be handled by the useEffect above
        return { error: null };
      }
      return result;
    } catch (error) {
      return { error };
    }
  };

  const handleSignUp = async (email: string, password: string, name: string, accountType: string): Promise<{ error?: any }> => {
    try {
      const result = await signUp(email, password, name, accountType);
      return result;
    } catch (error) {
      return { error };
    }
  };

  return (
    <BaseLayout variant="auth" className="bg-gradient-to-br from-primary/10 to-primary-foreground/10">
      <div className="w-full max-w-md">
        <SecureAuthForm 
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
        />
      </div>
    </BaseLayout>
  );
};

export default SecureAuth;