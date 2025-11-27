
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Apple } from "lucide-react";
import GoogleCalendarIntegration from "./GoogleCalendarIntegration";
import AppleCalendarIntegration from "./AppleCalendarIntegration";

const CalendarProviderSelector = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calendar Integrations</CardTitle>
        <CardDescription>
          Connect your preferred calendar provider to sync appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="google" className="flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4" />
              Google Calendar
            </TabsTrigger>
            <TabsTrigger value="apple" className="flex items-center justify-center gap-1">
              <Apple className="h-4 w-4" />
              Apple Calendar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="google">
            <GoogleCalendarIntegration />
          </TabsContent>
          
          <TabsContent value="apple">
            <AppleCalendarIntegration />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendarProviderSelector;
