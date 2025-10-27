
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, XCircle, ExternalLink } from 'lucide-react';
import { useAdminStats, AlertItem } from '@/hooks/useAdminStats';
import { useNavigate } from 'react-router-dom';

const SystemAlertsPanel: React.FC = () => {
  const { stats, loading } = useAdminStats();
  const navigate = useNavigate();

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
          System Alerts
        </CardTitle>
        <CardDescription>Important system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats?.systemAlerts.length ? (
            stats.systemAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              const colorClass = getAlertColor(alert.type);
              
              return (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${colorClass}`}>
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm opacity-80">{alert.description}</p>
                    </div>
                  </div>
                  {alert.actionRequired && alert.actionPath && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(alert.actionPath!)}
                      className="flex items-center gap-1"
                    >
                      Review
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">
              <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No alerts at this time</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemAlertsPanel;
