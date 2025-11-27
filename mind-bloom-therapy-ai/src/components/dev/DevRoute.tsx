
import React from 'react';
import { isDevelopmentMode } from '@/config/development';

interface DevRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const DevRoute: React.FC<DevRouteProps> = ({ children, fallback }) => {
  // In development mode, always render children without any checks
  if (isDevelopmentMode()) {
    return <>{children}</>;
  }
  
  // In production mode, render fallback (which could be protected routes)
  return <>{fallback || children}</>;
};

export default DevRoute;
