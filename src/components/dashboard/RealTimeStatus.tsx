import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRealTimeUpdates } from "@/hooks/use-realtime-updates";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

const RealTimeStatus = () => {
  const { user } = useAuthRBAC();
  const { isConnected } = useRealTimeUpdates(user?.id || '');

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );
};

export default RealTimeStatus;