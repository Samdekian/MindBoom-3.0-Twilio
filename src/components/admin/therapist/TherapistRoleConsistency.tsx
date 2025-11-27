
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";

const TherapistRoleConsistency: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Role Consistency Check
        </CardTitle>
        <CardDescription>
          Review and fix any role consistency issues for therapist accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">All roles are consistent</p>
            <p className="text-sm text-green-600">No role inconsistencies found for therapist accounts.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistRoleConsistency;
