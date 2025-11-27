
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const MobileTestResults: React.FC = () => {
  const [activeTab, setActiveTab] = useState("automated");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Testing Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">94%</div>
              <div className="text-sm font-medium mb-2">Test Pass Rate</div>
              <Progress value={94} className="h-2" />
            </div>
            
            <div className="flex flex-col p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">12</div>
              <div className="text-sm font-medium mb-2">Devices Tested</div>
              <div className="text-xs text-muted-foreground">iOS: 5, Android: 7</div>
            </div>
            
            <div className="flex flex-col p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
              <div className="text-sm font-medium mb-2">Mobile UI Coverage</div>
              <Progress value={98} className="h-2" />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="automated">Automated Tests</TabsTrigger>
              <TabsTrigger value="manual">Manual Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="automated">
              <div className="space-y-3">
                <TestResult 
                  name="Responsive Layout Tests"
                  status="pass"
                  device="All Breakpoints"
                  description="Testing layout integrity across standard breakpoints: 320px, 768px, 1024px, 1440px"
                />
                
                <TestResult 
                  name="Touch Event Handlers"
                  status="pass"
                  device="iOS/Android"
                  description="Validating correct touch event handling for interactive elements"
                />
                
                <TestResult 
                  name="Calendar Navigation Gestures"
                  status="warning"
                  device="Android"
                  description="Swipe gestures for calendar navigation have inconsistent behavior on some Android devices"
                />
                
                <TestResult 
                  name="Form Validation on Mobile"
                  status="pass"
                  device="All Devices"
                  description="Testing form input handling and validation with virtual keyboards"
                />
                
                <TestResult 
                  name="Video Conference Interface"
                  status="fail"
                  device="Small Screens (<360px)"
                  description="Control buttons overflow container on extremely small screens"
                />
                
                <TestResult 
                  name="Offline Functionality"
                  status="pass"
                  device="All Devices"
                  description="Validating application behavior with intermittent connectivity"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="manual">
              <div className="space-y-3">
                <TestResult 
                  name="Usability Testing: Therapist Flow"
                  status="pass"
                  device="Various"
                  description="Therapists could efficiently navigate and perform core tasks on mobile devices"
                />
                
                <TestResult 
                  name="Usability Testing: Patient Flow"
                  status="pass"
                  device="Various"
                  description="Patients could book appointments and attend sessions with minimal friction"
                />
                
                <TestResult 
                  name="Battery Usage Assessment"
                  status="warning"
                  device="All Devices"
                  description="Video conferencing feature uses significant battery - optimization needed"
                />
                
                <TestResult 
                  name="Screen Reader Compatibility"
                  status="pass"
                  device="iOS/Android"
                  description="Application is navigable using VoiceOver and TalkBack screen readers"
                />
                
                <TestResult 
                  name="Network Throttling Test"
                  status="pass"
                  device="All Devices"
                  description="Application gracefully degrades under slow network conditions (3G, etc.)"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

interface TestResultProps {
  name: string;
  status: "pass" | "fail" | "warning";
  device: string;
  description: string;
}

const TestResult: React.FC<TestResultProps> = ({ name, status, device, description }) => {
  return (
    <div className="p-3 border rounded-lg flex items-start gap-3">
      {status === "pass" && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
      {status === "fail" && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
      {status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />}
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
          <div className="font-medium">{name}</div>
          <Badge variant={status === "pass" ? "outline" : status === "warning" ? "secondary" : "destructive"} className="mt-1 sm:mt-0">
            {device}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
};

export default MobileTestResults;
