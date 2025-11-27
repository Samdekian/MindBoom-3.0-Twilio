
import React, { useState, useEffect } from "react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/core/rbac";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { asUserRoles } from "@/utils/rbac/type-adapters";

// Role details object with information about each role
const roleDetails: { [key in UserRole]?: { 
  description: string; 
  permissions: string[]; 
  precedence: number;
} } = {
  admin: {
    description: "Administrators have full access to all features and settings",
    permissions: [
      "users:manage", "roles:manage", "settings:manage", "patients:view", 
      "therapists:view", "appointments:manage", "system:access"
    ],
    precedence: 10
  },
  therapist: {
    description: "Therapists can manage their patients and appointments",
    permissions: [
      "patients:view", "patients:manage", "appointments:view", "appointments:manage", 
      "notes:create", "notes:view", "system:access"
    ],
    precedence: 20
  },
  patient: {
    description: "Patients can view their own appointments and records",
    permissions: [
      "appointments:view", "profile:edit", "records:view", "system:access"
    ],
    precedence: 30
  },
  support: {
    description: "Support staff can help users with system issues",
    permissions: [
      "users:view", "support:manage", "system:access"
    ],
    precedence: 25
  }
};

const RoleDetailsPanel: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { listRoles } = useRoleManagement();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const availableRoles = await listRoles();
        // Convert strings to UserRole type
        setRoles(asUserRoles(availableRoles));
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch roles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [listRoles, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role Details</h2>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="capitalize">{role}</CardTitle>
                  <CardDescription>
                    {roleDetails[role]?.description || "Role description not available"}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Precedence: {roleDetails[role]?.precedence || "N/A"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="permissions">
                  <AccordionTrigger>Permissions</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {roleDetails[role]?.permissions ? (
                        roleDetails[role]?.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          No permissions defined
                        </span>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="usage">
                  <AccordionTrigger>Usage & Guidelines</AccordionTrigger>
                  <AccordionContent>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="font-medium">When to assign:</dt>
                        <dd className="text-muted-foreground">
                          {role === "admin"
                            ? "Only assign to trusted staff who need full system access."
                            : role === "therapist"
                            ? "Assign to certified therapists who provide services."
                            : role === "patient"
                            ? "Assign to individuals receiving therapeutic services."
                            : "Assign to staff handling customer support inquiries."}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium">Security considerations:</dt>
                        <dd className="text-muted-foreground">
                          {role === "admin"
                            ? "Admins have full access. Regular security audits recommended."
                            : role === "therapist"
                            ? "Can access sensitive patient data. Ensure HIPAA compliance."
                            : role === "patient"
                            ? "Limited to own records, minimal security risk."
                            : "Can view user data but cannot modify system settings."}
                        </dd>
                      </div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleDetailsPanel;
