import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface SessionRecoveryProps {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectionAttempts: number;
  maxReconnectionAttempts: number;
  onManualReconnect: () => void;
  onLeaveSession: () => void;
}

export const SessionRecovery: React.FC<SessionRecoveryProps> = ({
  isConnected,
  isReconnecting,
  reconnectionAttempts,
  maxReconnectionAttempts,
  onManualReconnect,
  onLeaveSession
}) => {
  const [countdown, setCountdown] = useState(30);
  const [showCountdown, setShowCountdown] = useState(false);

  // Show countdown when disconnected for too long
  useEffect(() => {
    if (!isConnected && !isReconnecting && reconnectionAttempts >= 3) {
      setShowCountdown(true);
      setCountdown(30);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onLeaveSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setShowCountdown(false);
    }
  }, [isConnected, isReconnecting, reconnectionAttempts, onLeaveSession]);

  // Reset countdown when reconnected
  useEffect(() => {
    if (isConnected) {
      setShowCountdown(false);
      setCountdown(30);
    }
  }, [isConnected]);

  if (isConnected) {
    return null;
  }

  const progress = ((maxReconnectionAttempts - reconnectionAttempts) / maxReconnectionAttempts) * 100;
  const canRetry = reconnectionAttempts < maxReconnectionAttempts;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-card p-6 rounded-lg border shadow-lg">
        <div className="text-center">
          {isReconnecting ? (
            <RefreshCw className="h-12 w-12 text-warning mx-auto mb-4 animate-spin" />
          ) : (
            <WifiOff className="h-12 w-12 text-destructive mx-auto mb-4" />
          )}
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isReconnecting ? 'Reconnecting...' : 'Connection Lost'}
          </h2>
          
          <p className="text-muted-foreground text-sm">
            {isReconnecting 
              ? 'Attempting to restore your connection to the session'
              : 'Your connection to the video session was interrupted'
            }
          </p>
        </div>

        {reconnectionAttempts > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reconnection attempts</span>
              <span className="text-foreground">{reconnectionAttempts}/{maxReconnectionAttempts}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {showCountdown && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Session will end automatically in {countdown} seconds due to connection issues.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {canRetry && !isReconnecting && (
            <Button onClick={onManualReconnect} className="w-full">
              <Wifi className="h-4 w-4 mr-2" />
              Try Reconnecting
            </Button>
          )}
          
          <Button variant="outline" onClick={onLeaveSession} className="w-full">
            Leave Session
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Check your internet connection</p>
          <p>• Try refreshing the page if problems persist</p>
          <p>• Contact support if issues continue</p>
        </div>
      </div>
    </div>
  );
};