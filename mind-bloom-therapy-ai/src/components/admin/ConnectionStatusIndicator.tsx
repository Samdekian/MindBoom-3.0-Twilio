
import React, { useEffect, useState } from 'react';
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConnectionStatusIndicator = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error("Error checking connection:", error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {isConnected === null ? (
        <Badge variant="outline">Checking connection...</Badge>
      ) : isConnected ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Wifi className="h-3 w-3 mr-1" /> Connected
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <WifiOff className="h-3 w-3 mr-1" /> Disconnected
        </Badge>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={checkConnection} 
        disabled={isChecking}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        <span className="sr-only">Check connection</span>
      </Button>
    </div>
  );
};

export default ConnectionStatusIndicator;
