
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaywrightSetup from "./PlaywrightSetup";
import VitestSetup from "./VitestSetup";
import CIIntegration from "./CIIntegration";

const TestingToolsSetup: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Testing Framework Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="playwright">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="playwright">Playwright</TabsTrigger>
              <TabsTrigger value="vitest">Vitest</TabsTrigger>
            </TabsList>
            
            <TabsContent value="playwright" className="space-y-4">
              <PlaywrightSetup />
            </TabsContent>
            
            <TabsContent value="vitest" className="space-y-4">
              <VitestSetup />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Device Testing Matrix Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <CIIntegration />
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingToolsSetup;
