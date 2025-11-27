
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TestCases = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3">Mobile Test Cases</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Calendar Day View Rendering</h4>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Passing</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Test that the day view properly renders and scales on mobile devices with appropriate touch targets.
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Steps:</span> Load calendar, switch to day view, verify time slots are readable and appointments are properly displayed.
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Calendar Week View Gestures</h4>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Needs Improvement</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Test that swipe gestures correctly navigate between weeks in the calendar.
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Steps:</span> Load week view, perform left/right swipe gestures, verify correct week navigation and loading performance.
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Appointment Creation Form</h4>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Passing</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Test that the appointment creation form is usable on mobile devices with proper keyboard behavior.
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Steps:</span> Open new appointment form, test form field interactions, virtual keyboard behavior, and form submission.
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Google Calendar Integration</h4>
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Failing</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Test that Google Calendar connection flow works on mobile browsers.
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Steps:</span> Initiate Google Calendar connection, verify OAuth flow, test calendar selection UI on mobile.
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Sync Monitoring Dashboard</h4>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Passing</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Test that sync monitoring analytics are readable and functional on mobile devices.
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Steps:</span> Load monitoring dashboard, verify charts render correctly, test tab navigation and dashboard controls.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCases;
