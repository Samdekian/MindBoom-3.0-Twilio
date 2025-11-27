
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSecurity, SecurityLevel } from "@/contexts/SecurityContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export const SecurityLevelSelector: React.FC = () => {
  const { securityLevel, updateSecurityLevel, logSecurityEvent } = useSecurity();

  const handleSecurityLevelChange = async (value: string) => {
    const newLevel = value as SecurityLevel;
    await updateSecurityLevel(newLevel);
    
    await logSecurityEvent("security_level_changed", {
      previous_level: securityLevel,
      new_level: newLevel
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Level</CardTitle>
        <CardDescription>
          Choose the appropriate security level for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={securityLevel} 
          onValueChange={handleSecurityLevelChange}
          className="space-y-4"
        >
          <div className="flex items-start space-x-3 rounded-md border p-3">
            <RadioGroupItem value="standard" id="standard" />
            <div className="flex flex-col">
              <Label htmlFor="standard" className="font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2 text-slate-500" />
                Standard
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Basic security features for regular users. 
                Standard authentication and access controls.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-md border p-3">
            <RadioGroupItem value="enhanced" id="enhanced" />
            <div className="flex flex-col">
              <Label htmlFor="enhanced" className="font-medium flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                Enhanced
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced security with two-factor authentication requirement.
                Enhanced logging and monitoring capabilities.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-md border p-3">
            <RadioGroupItem value="hipaa" id="hipaa" />
            <div className="flex flex-col">
              <Label htmlFor="hipaa" className="font-medium flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2 text-green-500" />
                HIPAA Compliant
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Highest level of security for healthcare providers.
                Comprehensive audit logging and strict access controls.
                Full compliance with healthcare data protection standards.
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
