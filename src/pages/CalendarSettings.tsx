
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import OptimizedGoogleCalendarIntegration from '../components/dashboard/OptimizedGoogleCalendarIntegration';
import CalendarPermissionsManager from '../components/calendar/CalendarPermissionsManager';
import CalendarCategoriesManager from '../components/calendar/CalendarCategoriesManager';
import CalendarSyncMonitor from '../components/calendar/CalendarSyncMonitor';

const CalendarSettings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Calendar Settings</title>
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendar Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your calendar connections, synchronization settings, and preferences
        </p>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections">
          <Card className="p-0">
            <OptimizedGoogleCalendarIntegration />
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <CalendarPermissionsManager />
        </TabsContent>
        
        <TabsContent value="categories">
          <CalendarCategoriesManager />
        </TabsContent>
        
        <TabsContent value="monitoring">
          <CalendarSyncMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarSettings;
