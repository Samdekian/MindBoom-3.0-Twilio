
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const TestingProcess = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3">Testing Process</h3>
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Automated Testing</h4>
              <p className="text-sm text-muted-foreground">
                We've implemented Vitest tests for core calendar functionality including synchronization 
                and event management. Automated tests run on each code change.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Browser Stack Testing</h4>
              <p className="text-sm text-muted-foreground">
                Manual testing across 10+ popular mobile device configurations using BrowserStack. 
                Each major feature is tested on iOS Safari and Android Chrome at minimum.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Performance Testing</h4>
              <p className="text-sm text-muted-foreground">
                Performance metrics are collected for calendar operations including loading time,
                rendering performance, and API response times. We've implemented a monitoring system
                to track these metrics over time.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Beta Testing Group</h4>
              <p className="text-sm text-muted-foreground">
                A group of 15 therapists are participating in beta testing of the calendar functionality
                on their personal mobile devices, providing real-world usage feedback.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Accessibility Testing</h4>
              <p className="text-sm text-muted-foreground">
                Calendar UI components are tested with screen readers and keyboard navigation.
                Color contrast ratios meet WCAG AA standards.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingProcess;
