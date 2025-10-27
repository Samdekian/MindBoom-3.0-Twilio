
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calendarTasks } from "./data/calendar-tasks";
import { calculateProgress } from "./TasksData";
import { StatusBadge } from "./TaskBadges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CalendarImplementationPlan: React.FC = () => {
  const completedPercentage = calculateProgress(calendarTasks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Integration Plan</CardTitle>
        <CardDescription>
          Implementation status: {completedPercentage}% complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="google">Google Calendar</TabsTrigger>
            <TabsTrigger value="apple">Apple Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>OAuth integration with Google Calendar and Apple Calendar</li>
                <li>Two-way synchronization of appointments</li>
                <li>Customizable calendar notification preferences</li>
                <li>Support for recurring appointments</li>
                <li>Multiple calendar view options (day/week/month)</li>
                <li>Conflict detection and resolution</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Implementation Status</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calendarTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>{task.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="google" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Google Calendar Integration</h3>
              <p className="text-muted-foreground mb-2">
                Google Calendar integration is implemented using OAuth 2.0 and Google Calendar API v3.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>OAuth 2.0 authentication flow</li>
                <li>Refresh token management</li>
                <li>Event creation, retrieval, and updates</li>
                <li>Two-way synchronization</li>
                <li>Background sync using Supabase Edge Functions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Implementation Details</h3>
              <p className="text-muted-foreground mb-2">
                The Google Calendar integration is built using:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Supabase Edge Functions for secure API communication</li>
                <li>Token refresh mechanism for long-term access</li>
                <li>React hooks for state management</li>
                <li>Real-time updates for immediate calendar changes</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="apple" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Apple Calendar Integration</h3>
              <p className="text-muted-foreground mb-2">
                Apple Calendar integration will be implemented using Apple's CloudKit JS and CalDAV protocol.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sign in with Apple authentication</li>
                <li>CalDAV protocol for calendar access</li>
                <li>iCloud Calendar API integration</li>
                <li>Two-way synchronization support</li>
                <li>Push notification support for updates</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Implementation Status</h3>
              <p className="text-muted-foreground mb-2 italic">
                Apple Calendar integration is currently in planning phase. Implementation will begin after Google Calendar integration is complete.
              </p>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="font-medium text-amber-800 mb-2">Development Prerequisites</h4>
                <ul className="list-disc pl-5 space-y-1 text-amber-700">
                  <li>Apple Developer account registration</li>
                  <li>App registration in Apple Developer Console</li>
                  <li>CloudKit container configuration</li>
                  <li>Sign in with Apple credentials</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Technical Approach</h3>
              <p className="text-muted-foreground mb-2">
                The Apple Calendar integration will leverage:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sign in with Apple for authentication</li>
                <li>CloudKit JS for direct iCloud access</li>
                <li>CalDAV protocol for advanced calendar operations</li>
                <li>Supabase Edge Functions for server-side operations</li>
                <li>React hooks for frontend state management</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendarImplementationPlan;
