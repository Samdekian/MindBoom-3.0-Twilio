import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { validateRouteAccess, RouteValidationResult } from '@/utils/routing/route-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Route Validator Component
 * Shows current route validation status - useful for debugging and testing
 */
export const RouteValidator: React.FC<{
  showInProduction?: boolean;
}> = ({
  showInProduction = false
}) => {
  const location = useLocation();
  const {
    userRoles,
    isAuthenticated,
    loading
  } = useAuthRBAC();
  const [validation, setValidation] = useState<RouteValidationResult | null>(null);

  // Only show in development unless explicitly enabled for production
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && !showInProduction) {
    return null;
  }
  useEffect(() => {
    if (!loading) {
      const result = validateRouteAccess(location.pathname, userRoles, isAuthenticated);
      setValidation(result);
    }
  }, [location.pathname, userRoles, isAuthenticated, loading]);
  if (loading || !validation) {
    return null;
  }
  const getStatusIcon = () => {
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };
  const getStatusBadge = () => {
    if (validation.isValid) {
      return <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Needs Redirect</Badge>;
  };
  return;
};
export default RouteValidator;