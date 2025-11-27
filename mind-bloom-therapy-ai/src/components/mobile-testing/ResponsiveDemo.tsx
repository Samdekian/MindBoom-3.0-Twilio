
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import ResponsiveVideoGrid from "@/components/video-conference/components/ResponsiveVideoGrid";

const ResponsiveDemo: React.FC = () => {
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState<"default" | "mobile" | "tablet" | "desktop">("default");
  
  // Mock video references for demo
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);
  
  const getViewportClass = () => {
    if (selectedView === "default") return "";
    if (selectedView === "mobile") return "max-w-[375px] mx-auto border-8 border-gray-800 rounded-3xl overflow-hidden";
    if (selectedView === "tablet") return "max-w-[768px] mx-auto border-8 border-gray-800 rounded-3xl overflow-hidden";
    return "max-w-[1200px] mx-auto border-4 border-gray-800 rounded-lg overflow-hidden";
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle>Responsive Interface Demonstration</CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedView} onValueChange={(val: any) => setSelectedView(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select viewport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Natural Viewport</SelectItem>
                <SelectItem value="mobile">Mobile Viewport</SelectItem>
                <SelectItem value="tablet">Tablet Viewport</SelectItem>
                <SelectItem value="desktop">Desktop Viewport</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className={getViewportClass()}>
            <Tabs defaultValue="video">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="video">Video Conference</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg h-[300px] flex items-center justify-center">
                  <ResponsiveVideoGrid
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                    isScreenSharing={false}
                    connectionQuality="good"
                    connectionState="CONNECTED"
                    isInSession={true}
                    isMobileView={selectedView === "mobile"}
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm">
                    <Smartphone className="h-4 w-4 mr-2" /> Mute
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tablet className="h-4 w-4 mr-2" /> Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <Monitor className="h-4 w-4 mr-2" /> Share
                  </Button>
                  <Button variant="destructive" size="sm">
                    End
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mt-2">
                  <p>This demo shows how the video interface adapts to different viewport sizes:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Side-by-side layout on larger screens</li>
                    <li>Stacked video layout on mobile devices</li>
                    <li>Compact controls that adapt to available space</li>
                    <li>Touch-friendly buttons with adequate spacing</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="h-[300px] border rounded-md flex items-center justify-center bg-gray-50">
                  <p className="text-center text-muted-foreground">Calendar responsive demo coming soon...</p>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Calendar view adaptations include:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Week view on desktop, day view on mobile</li>
                    <li>Touch-optimized appointment creation</li>
                    <li>Swipe gestures for date navigation</li>
                    <li>Simplified controls on smaller screens</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="dashboard">
                <div className="h-[300px] border rounded-md flex items-center justify-center bg-gray-50">
                  <p className="text-center text-muted-foreground">Dashboard responsive demo coming soon...</p>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Dashboard responsive features:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Single column layout on mobile devices</li>
                    <li>Priority content first on smaller screens</li>
                    <li>Collapsible sections for better space utilization</li>
                    <li>Touch-optimized cards and widgets</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {isMobile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <span className="font-medium">Notice:</span> You're viewing this demo on an actual mobile device! 
                Try rotating your device to see how the interface adapts to different orientations.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponsiveDemo;
