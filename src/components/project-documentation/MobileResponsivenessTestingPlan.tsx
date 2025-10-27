
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import TestingScope from "@/components/project-documentation/mobile-testing/TestingScope";
import DeviceMatrix from "@/components/project-documentation/mobile-testing/DeviceMatrix";
import TestCases from "@/components/project-documentation/mobile-testing/TestCases";
import TestingProcess from "@/components/project-documentation/mobile-testing/TestingProcess";

const MobileResponsivenessTestingPlan = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" /> 
              Mobile Responsiveness Testing Plan
            </CardTitle>
            <CardDescription>
              Comprehensive strategy to ensure dashboard works seamlessly across all device sizes
            </CardDescription>
          </div>
          <Badge className="bg-amber-600">In Progress</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TestingScope />
        <DeviceMatrix />
        <TestCases />
        <TestingProcess />
        
        {isMobile && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> You're viewing this testing plan on a mobile device, 
              which helps validate our responsive design approach.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileResponsivenessTestingPlan;
