
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileResponsivenessTestingPlan from "@/components/MobileResponsivenessTestingPlan";
import { Separator } from "@/components/ui/separator";
import { Smartphone, TabletSmartphone, TestTube, PlayCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTestResults from "@/components/mobile-testing/MobileTestResults";
import ResponsiveDemo from "@/components/mobile-testing/ResponsiveDemo";
import TestingToolsSetup from "@/components/mobile-testing/TestingToolsSetup";

const MobileOptimizationPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mobile Optimization & Testing</h1>
        <p className="text-muted-foreground">
          Phase 4: Mobile Experience Enhancement & Testing Framework Implementation
        </p>
        
        {isMobile && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
            <p className="text-sm text-blue-700">
              <span className="font-medium">📱 Mobile detected:</span> You're currently viewing this page on a mobile device,
              allowing you to experience our responsive optimizations firsthand.
            </p>
          </div>
        )}
      </div>
      
      <Separator />
      
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <TabletSmartphone className="h-4 w-4" /> Responsive Demo
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" /> Test Results
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" /> Tools
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Experience Enhancement</CardTitle>
              <CardDescription>
                Optimizing the application for all screen sizes and touch interfaces
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Responsive Design Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Fluid grid layouts that adapt to any screen width</li>
                      <li>Viewport-specific component rendering</li>
                      <li>Mobile-first CSS approach with responsive breakpoints</li>
                      <li>Touch-friendly UI elements with appropriate sizing</li>
                      <li>Optimized typography for readability across devices</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Touch Interface Improvements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Enhanced touch targets (min 44×44px) for better usability</li>
                      <li>Gesture recognition for video controls</li>
                      <li>Touch-optimized calendar interactions</li>
                      <li>Swipe navigation for multi-step processes</li>
                      <li>Mobile-specific hover state alternatives</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Progressive Enhancement Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Core Experience (All Devices)</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Essential appointment booking</li>
                        <li>Calendar viewing functionality</li>
                        <li>Basic therapy notes</li>
                        <li>Standard authentication</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Enhanced Experience (Mid-tier)</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>More sophisticated UI animations</li>
                        <li>Enhanced data visualizations</li>
                        <li>Calendar drag-and-drop</li>
                        <li>Offline data capabilities</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium mb-2">Rich Experience (Modern Devices)</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Full video conferencing features</li>
                        <li>Advanced screen annotation</li>
                        <li>Real-time collaboration tools</li>
                        <li>Complex data analytics</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demo">
          <ResponsiveDemo />
        </TabsContent>
        
        <TabsContent value="testing">
          <MobileTestResults />
        </TabsContent>
        
        <TabsContent value="tools">
          <TestingToolsSetup />
        </TabsContent>
      </Tabs>

      <MobileResponsivenessTestingPlan />
    </div>
  );
};

export default MobileOptimizationPage;
