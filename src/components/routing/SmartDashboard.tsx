import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getRoleBasedDashboard } from '@/utils/routing/unified-route-config';
import { LoadingState } from '@/components/ui/loading-state';

/**
 * Smart Dashboard Component
 * 
 * Handles the /dashboard route by intelligently redirecting users
 * to their appropriate role-based dashboard
 */
const SmartDashboard: React.FC = () => {
  const { user, loading, isAuthenticated, primaryRole, isInitialized, rolesLoaded } = useAuthRBAC();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[SmartDashboard] Current state:', {
    isAuthenticated,
    primaryRole,
    loading,
    isInitialized,
    rolesLoaded,
    pathname: location.pathname,
    user: user?.id
  });

  useEffect(() => {
    console.log('[SmartDashboard] Effect triggered:', {
      loading,
      isInitialized,
      rolesLoaded,
      isAuthenticated,
      primaryRole,
      userRoles: user?.id,
      pathname: location.pathname
    });

    if (loading || !isInitialized) {
      console.log('[SmartDashboard] Still loading or not initialized, waiting...');
      return;
    }

    if (!isAuthenticated) {
      console.log('[SmartDashboard] Not authenticated, will redirect to login');
      return;
    }

    if (!rolesLoaded) {
      console.log('[SmartDashboard] Roles not loaded yet, waiting...');
      return;
    }

    // Add timeout to prevent infinite redirects
    const redirectTimeout = setTimeout(() => {
      if (primaryRole) {
        const correctDashboard = getRoleBasedDashboard(primaryRole);
        console.log(`[SmartDashboard] Redirecting ${primaryRole} to ${correctDashboard}`);
        navigate(correctDashboard, { replace: true });
      } else {
        console.log('[SmartDashboard] No primary role found after roles loaded, defaulting to patient');
        navigate('/patient', { replace: true });
      }
    }, 100); // Small delay to prevent race conditions

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, primaryRole, loading, isInitialized, rolesLoaded, navigate, location.pathname, user]);

  if (loading || !isInitialized || !rolesLoaded) {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text={!rolesLoaded ? "Loading user roles..." : "Loading dashboard..."} 
        fullscreen={true}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // This should not render as the useEffect should redirect
  return (
    <LoadingState 
      variant="spinner" 
      size="lg" 
      text="Redirecting to dashboard..." 
      fullscreen={true}
    />
  );
};

export default SmartDashboard;