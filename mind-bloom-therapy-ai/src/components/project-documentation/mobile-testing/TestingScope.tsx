
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TestingScope = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3">Testing Scope</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Primary Focus Areas</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Mobile device compatibility across iOS and Android</li>
              <li>Desktop-to-mobile responsive behavior</li>
              <li>Touch interactions for calendar manipulation</li>
              <li>Form usability on smaller screens</li>
              <li>Loading and performance optimization</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Critical User Journeys</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Appointment booking on mobile</li>
              <li>Calendar navigation using touch gestures</li>
              <li>Google Calendar integration setup</li>
              <li>Viewing and managing sync settings</li>
              <li>Troubleshooting sync issues on mobile</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingScope;
