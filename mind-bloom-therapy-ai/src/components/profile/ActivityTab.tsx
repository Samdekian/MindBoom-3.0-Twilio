import React, { useState, useEffect } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { CalendarClock, LogIn, LogOut, Settings, ShieldCheck, Edit, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Json } from "@/integrations/supabase/types";

interface ActivityLog {
  id: string;
  activity_type: string;
  activity_timestamp: string;
  metadata: Record<string, any>;
  ip_address?: string;
  resource_id?: string;
  resource_type?: string;
  user_id: string;
}

const ActivityTab = () => {
  const { user } = useAuthRBAC();
  const { t } = useLanguage();
  const { toast } = useToast();

  const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("activity_timestamp", { ascending: false })
      .limit(20);
      
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive",
      });
      throw error;
    }
    
    return (data as ActivityLog[]) || [];
  };
  
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ["activityLogs", user?.id],
    queryFn: fetchActivityLogs,
    enabled: !!user,
  });

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "sign_in":
        return <LogIn className="h-4 w-4" />;
      case "sign_out":
        return <LogOut className="h-4 w-4" />;
      case "profile_updated":
        return <Edit className="h-4 w-4" />;
      case "two_factor_setup_initiated":
      case "two_factor_enabled":
      case "two_factor_disabled":
        return <ShieldCheck className="h-4 w-4" />;
      case "hipaa_consent_provided":
        return <ShieldCheck className="h-4 w-4" />;
      case "security_settings_changed":
        return <Settings className="h-4 w-4" />;
      case "failed_login_attempt":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CalendarClock className="h-4 w-4" />;
    }
  };
  
  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case "sign_in":
        return t("signedIn") || "Signed In";
      case "sign_out":
        return t("signedOut") || "Signed Out";
      case "profile_updated":
        return t("profileUpdated") || "Profile Updated";
      case "two_factor_setup_initiated":
        return t("twoFactorSetupInitiated") || "Two-Factor Setup Initiated";
      case "two_factor_enabled":
        return t("twoFactorEnabled") || "Two-Factor Authentication Enabled";
      case "two_factor_disabled":
        return t("twoFactorDisabled") || "Two-Factor Authentication Disabled";
      case "hipaa_consent_provided":
        return t("hipaaConsentProvided") || "HIPAA Consent Provided";
      case "security_settings_changed":
        return t("securitySettingsChanged") || "Security Settings Changed";
      case "failed_login_attempt":
        return t("failedLoginAttempt") || "Failed Login Attempt";
      default:
        return activityType.replace(/_/g, " ");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("activityHistory") || "Activity History"}</CardTitle>
        <CardDescription>
          {t("activityHistoryDescription") || "Recent account activity and security events"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activityLogs && activityLogs.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b">
                  <div className="bg-muted p-2 rounded-full">
                    {getActivityIcon(log.activity_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <p className="font-medium">{getActivityLabel(log.activity_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.activity_timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.metadata.fields_updated ? `Updated: ${log.metadata.fields_updated.join(", ")}` : ""}
                        {log.metadata.ip_address ? `IP: ${log.metadata.ip_address}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t("noActivityHistory") || "No activity history available"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTab;
