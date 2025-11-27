
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  database: 'healthy' | 'unhealthy' | 'checking';
  api: 'healthy' | 'unhealthy' | 'checking';
  storage: 'healthy' | 'unhealthy' | 'checking';
  lastCheck: Date | null;
}

export function useHealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    database: 'checking',
    api: 'checking',
    storage: 'checking',
    lastCheck: null
  });

  const checkHealth = async () => {
    setStatus(prev => ({
      ...prev,
      database: 'checking',
      api: 'checking',
      storage: 'checking'
    }));

    try {
      // Check database connectivity
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      // Check API connectivity by attempting to get user
      const { error: apiError } = await supabase.auth.getUser();

      setStatus({
        database: dbError ? 'unhealthy' : 'healthy',
        api: apiError ? 'unhealthy' : 'healthy',
        storage: 'healthy', // Assume healthy if no specific storage operations
        lastCheck: new Date()
      });
    } catch (error) {
      setStatus({
        database: 'unhealthy',
        api: 'unhealthy',
        storage: 'unhealthy',
        lastCheck: new Date()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    checkHealth,
    isHealthy: status.database === 'healthy' && status.api === 'healthy'
  };
}
