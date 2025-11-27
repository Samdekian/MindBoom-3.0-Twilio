
import React, { Suspense } from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import { HealthIndicator } from '@/components/monitoring/HealthIndicator';
import { useHealthCheck } from '@/hooks/use-health-check';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductionLayoutProps {
  children: React.ReactNode;
  showHealthIndicator?: boolean;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ProductionLayout: React.FC<ProductionLayoutProps> = ({ 
  children, 
  showHealthIndicator = false 
}) => {
  const { isHealthy } = useHealthCheck();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {!isHealthy && (
          <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System is experiencing issues. Some features may be unavailable.
            </AlertDescription>
          </Alert>
        )}
        
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
        
        {showHealthIndicator && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            <HealthIndicator />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
