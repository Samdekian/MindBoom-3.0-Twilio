
import { Navigate } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getRoleBasedDashboard } from '@/utils/routing/unified-route-config';
import { LoadingState } from '@/components/ui/loading-state';

const SmartDashboardRedirect = () => {
  const { primaryRole, loading, isAuthenticated } = useAuthRBAC();

  if (loading) {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text="Loading..." 
        fullscreen={true}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on primary role
  const redirectPath = primaryRole ? getRoleBasedDashboard(primaryRole) : '/patient';

  return <Navigate to={redirectPath} replace />;
};

export default SmartDashboardRedirect;
