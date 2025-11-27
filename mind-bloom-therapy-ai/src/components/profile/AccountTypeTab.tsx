import React, { useState } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRoles } from "@/hooks/useRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HipaaConsentDialog from "@/components/HipaaConsentDialog";

const AccountTypeTab = () => {
  const { user } = useAuthRBAC();
  const { t } = useLanguage();
  const { roles, hasRole } = useRoles();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const accountType = user?.user_metadata?.accountType || "patient";
  const isAdmin = hasRole("admin");

  const handleConsentComplete = () => {
    setDialogOpen(false);
    // Refresh user data if needed
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("accountType") || "Account Type"}</CardTitle>
        <CardDescription>
          {t("accountTypeDescription") || "Manage your account type and related settings"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{t("currentAccountType") || "Current Account Type"}</h3>
            <Badge variant="secondary">
              {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t(`${accountType}AccountDescription`) || 
              `You have a ${accountType} account with standard privileges.`}
          </p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">{t("userRoles") || "User Roles"}</h3>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant={role === "admin" ? "default" : "outline"}>
                {role}
              </Badge>
            ))}
            {roles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("noRolesAssigned") || "No special roles assigned"}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">{t("hipaaCompliance") || "HIPAA Compliance"}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("hipaaComplianceDescription") || "HIPAA consent is required to use certain features."}
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("consentStatus") || "Consent Status"}</span>
              <Badge variant={user?.user_metadata?.hipaaConsent ? "default" : "outline"}>
                {user?.user_metadata?.hipaaConsent 
                  ? (t("consentProvided") || "Consent Provided") 
                  : (t("consentRequired") || "Consent Required")}
              </Badge>
            </div>
            
            {!user?.user_metadata?.hipaaConsent && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => setDialogOpen(true)}
              >
                {t("provideHipaaConsent") || "Provide HIPAA Consent"}
              </Button>
            )}
            
            <HipaaConsentDialog 
              open={dialogOpen} 
              onOpenChange={setDialogOpen}
              onConsent={handleConsentComplete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTypeTab;
