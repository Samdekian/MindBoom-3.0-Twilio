import React, { useEffect } from 'react';
import { ProductionErrorBoundary, VideoConferenceErrorBoundary } from '@/components/production/ProductionErrorBoundary';
import { initializeProduction } from '@/lib/production/monitoring';
import { usePerformanceMonitoring } from '@/hooks/useProductionMonitoring';

interface ProductionWrapperProps {
  children: React.ReactNode;
}

export const ProductionWrapper: React.FC<ProductionWrapperProps> = ({ children }) => {
  const { startRender, endRender } = usePerformanceMonitoring('ProductionWrapper');

  useEffect(() => {
    startRender();
    
    // Initialize production services only once
    let initialized = false;
    
    const initialize = async () => {
      if (!initialized) {
        initialized = true;
        await initializeProduction();
      }
    };

    initialize();
    endRender();
  }, [startRender, endRender]);

  return (
    <ProductionErrorBoundary context="main_application">
      {children}
    </ProductionErrorBoundary>
  );
};

// Production ready main layout wrapper
interface ProductionLayoutProps {
  children: React.ReactNode;
  showHealthIndicator?: boolean;
}

export const ProductionLayout: React.FC<ProductionLayoutProps> = ({ 
  children, 
  showHealthIndicator = true 
}) => {
  const { startRender, endRender } = usePerformanceMonitoring('ProductionLayout');
  
  useEffect(() => {
    startRender();
    return () => endRender();
  }, [startRender, endRender]);

  return (
    <div className="min-h-screen bg-background">
      {showHealthIndicator && <SystemHealthIndicator />}
      <ProductionWrapper>
        {children}
      </ProductionWrapper>
    </div>
  );
};

// System health indicator component
const SystemHealthIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [healthStatus, setHealthStatus] = React.useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');

  useEffect(() => {
    // Only show health indicator in development or if there are issues
    const shouldShow = process.env.NODE_ENV === 'development' || healthStatus !== 'healthy';
    setIsVisible(shouldShow);
  }, [healthStatus]);

  if (!isVisible) return null;

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500', 
    unhealthy: 'bg-red-500'
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-1 bg-white shadow-lg rounded-full border">
        <div className={`w-2 h-2 rounded-full ${statusColors[healthStatus]}`} />
        <span className="text-xs font-medium capitalize">{healthStatus}</span>
      </div>
    </div>
  );
};