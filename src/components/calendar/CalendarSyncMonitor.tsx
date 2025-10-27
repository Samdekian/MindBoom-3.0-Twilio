
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Activity,
  Settings,
  RotateCw,
  AlertCircle,
  Timer,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/use-google-calendar';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SyncActivity {
  id: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

const CalendarSyncMonitor = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, isLoading: isGoogleLoading, calendarId, calendarTitle } = useGoogleCalendar();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncActivity[]>([]);
  const [syncInterval, setSyncInterval] = useState<number>(60); // Default to 60 minutes

  // Fetch sync history
  const { data: syncLogs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['calendarSyncLogs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('calendar_sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching sync logs:", error);
        return [];
      }
      
      return data || [];
    },
    refetchInterval: 60_000 * 5, // Refetch every 5 minutes
  });

  useEffect(() => {
    if (syncLogs) {
      setSyncHistory(syncLogs);
    }
  }, [syncLogs]);

  // Fetch last sync time
  const { data: lastSyncData, isLoading: isLastSyncLoading } = useQuery({
    queryKey: ['lastCalendarSync', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('therapist_settings')
        .select('last_calendar_sync')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching last sync time:", error);
        return null;
      }
      
      return data?.last_calendar_sync || null;
    },
    refetchInterval: 60_000 * 10, // Refetch every 10 minutes
  });

  useEffect(() => {
    if (lastSyncData) {
      setLastSync(lastSyncData);
    }
  }, [lastSyncData]);

  // Sync calendar mutation
  const syncCalendar = useMutation({
    mutationFn: async () => {
      if (!user?.id || !calendarId) {
        throw new Error("User not authenticated or calendar not connected");
      }
      
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          calendarId: calendarId,
          timeMin: new Date().toISOString(),
          userId: user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onMutate: () => {
      setSyncing(true);
      setSyncHistory(prev => [
        {
          id: Date.now().toString(),
          status: 'pending',
          message: 'Sync started...',
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    },
    onSuccess: async () => {
      toast({
        title: "Calendar Synced",
        description: "Your calendar has been successfully synced.",
      });
      
      setSyncHistory(prev => {
        const latest = prev[0];
        if (latest && latest.status === 'pending') {
          return [{ ...latest, status: 'success', message: 'Sync completed successfully' }, ...prev.slice(1)];
        }
        return prev;
      });
      
      await queryClient.invalidateQueries({ queryKey: ['calendarSyncLogs'] });
      await queryClient.invalidateQueries({ queryKey: ['lastCalendarSync'] });
    },
    onError: (error: any) => {
      console.error("Sync error:", error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync calendar. Please try again.",
        variant: "destructive",
      });
      
      setSyncHistory(prev => {
        const latest = prev[0];
        if (latest && latest.status === 'pending') {
          return [{ ...latest, status: 'error', message: error.message || 'Sync failed' }, ...prev.slice(1)];
        }
        return prev;
      });
    },
    onSettled: () => {
      setSyncing(false);
    }
  });

  const handleSync = async () => {
    await syncCalendar.mutateAsync();
  };

  const getConnectionStatus = () => {
    if (isGoogleLoading) {
      return 'Checking...';
    } else if (isConnected) {
      return 'Connected';
    } else {
      return 'Not Connected';
    }
  };

  const getSyncStatus = () => {
    if (syncing) {
      return 'Syncing...';
    } else if (lastSync) {
      return `Last synced ${formatDistanceToNow(new Date(lastSync), { addSuffix: true })}`;
    } else {
      return 'Not synced yet';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Sync
        </CardTitle>
        <CardDescription>
          Manage your Google Calendar connection and sync settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isGoogleLoading ? (
          <div className="flex items-center justify-center">
            <Activity className="mr-2 h-4 w-4 animate-spin" />
            Checking Google Calendar connection...
          </div>
        ) : !isConnected ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              You are not connected to Google Calendar. Please connect to sync your appointments.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">
                  {calendarTitle || 'Google Calendar'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Connection Status: {getConnectionStatus()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sync Status: {getSyncStatus()}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSync} 
                disabled={syncing || isGoogleLoading}
              >
                {syncing ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-muted-foreground">
                Sync History
              </h5>
              <div className="mt-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-track-transparent">
                {syncHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sync history available.</p>
                ) : (
                  <div className="space-y-1">
                    {syncHistory.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {log.status === 'pending' && <Clock className="h-3 w-3 animate-spin" />}
                          {log.status === 'success' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {log.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          <p className="truncate">{log.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarSyncMonitor;
