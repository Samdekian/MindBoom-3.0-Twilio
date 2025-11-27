
// Standalone provider export for flexibility
import React from 'react';
import { AuthRBACProvider as BaseAuthRBACProvider } from '@/contexts/AuthRBACContext';

interface AuthRBACProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthRBACProvider: React.FC<AuthRBACProviderProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <BaseAuthRBACProvider>
      {children}
    </BaseAuthRBACProvider>
  );
};

export default AuthRBACProvider;
