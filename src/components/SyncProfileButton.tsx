
import React from "react";
import { Button } from "@/components/ui/button";
import { useSyncUserMetadata } from "@/hooks/use-sync-user-metadata";
import { useRBAC } from "@/hooks/useRBAC";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

interface SyncProfileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link" | "secondary";
  size?: "default" | "sm" | "lg";
  showMismatchIndicator?: boolean;
}

export default function SyncProfileButton({
  variant = "default",
  size = "default",
  className,
  showMismatchIndicator = false,
  children,
  ...props
}: SyncProfileButtonProps) {
  const { syncMetadataWithRoles, isSyncing } = useSyncUserMetadata();
  const { roles, refreshRoles } = useRBAC();
  
  // Handle sync with proper error handling and role refresh
  const handleSync = async () => {
    try {
      const success = await syncMetadataWithRoles();
      if (success) {
        // If sync was successful, refresh roles
        await refreshRoles();
      }
    } catch (error) {
      console.error("Error synchronizing profile:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isSyncing}
      className={cn(className)}
      {...props}
    >
      {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
      {showMismatchIndicator && <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />}
      {children || "Sync Profile"}
    </Button>
  );
}
