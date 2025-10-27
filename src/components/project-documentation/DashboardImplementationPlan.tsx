import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tasks } from "./data/tasks";
import MobileResponsivenessTestingPlan from "./MobileResponsivenessTestingPlan";

const DashboardImplementationPlan = () => {
  // Filter for dashboard-related tasks
  const dashboardTasks = tasks.filter(task => task.id.startsWith("dashboard-"));
  
  // Count tasks by status
  const implementedCount = dashboardTasks.filter(task => task.status === "implemented").length;
  const inProgressCount = dashboardTasks.filter(task => task.status === "inProgress").length;
  const plannedCount = dashboardTasks.filter(task => task.status === "planned").length;
  
  // Calculate overall progress percentage
  const progressPercentage = Math.round((implementedCount / dashboardTasks.length) * 100);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Patient Dashboard Implementation</CardTitle>
          <CardDescription>
            Detailed implementation plan and status for patient dashboard features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-medium">Overall Progress: {progressPercentage}%</h3>
              <div className="flex gap-2">
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {implementedCount} Completed
                </Badge>
                <Badge className="bg-amber-600">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {inProgressCount} In Progress
                </Badge>
                <Badge className="bg-blue-600">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {plannedCount} Planned
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="h-2.5 bg-green-600 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Implemented Features</h3>
              <ul className="list-disc pl-5 space-y-1">
                {dashboardTasks
                  .filter(task => task.status === "implemented")
                  .map(task => (
                    <li key={task.id}>
                      <span className="font-medium">{task.title}</span> - {task.description}
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">In Progress</h3>
              <ul className="list-disc pl-5 space-y-1">
                {dashboardTasks
                  .filter(task => task.status === "inProgress")
                  .map(task => (
                    <li key={task.id}>
                      <span className="font-medium">{task.title}</span> - {task.description}
                    </li>
                  ))}
                {dashboardTasks.filter(task => task.status === "inProgress").length === 0 && (
                  <li className="text-muted-foreground">No tasks currently in progress</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Remaining Tasks for Deployment</h3>
              <ul className="list-disc pl-5 space-y-1">
                {dashboardTasks
                  .filter(task => task.status === "planned")
                  .map(task => (
                    <li key={task.id}>
                      <span className="font-medium">{task.title}</span> - {task.description}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-2">Next Steps for Full Deployment</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <span className="font-medium">Calendar Integration</span> - Implement Google Calendar and Apple Calendar APIs for appointment synchronization
                </li>
                <li>
                  <span className="font-medium">Video Conferencing</span> - Integrate secure WebRTC video calling for therapy sessions
                </li>
                <li>
                  <span className="font-medium">Therapist Dashboard</span> - Create therapist view with patient management and mood prediction
                </li>
                <li>
                  <span className="font-medium">Health Records</span> - Implement HIPAA-compliant health records storage and access
                </li>
                <li>
                  <span className="font-medium">Mobile Testing</span> - Complete comprehensive testing across all device types
                </li>
                <li>
                  <span className="font-medium">Deployment Pipeline</span> - Set up CI/CD pipeline for dashboard features
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Mobile Responsiveness Testing</h2>
        <div className="text-muted-foreground mb-4">
          Comprehensive testing strategy to validate dashboard performance across various devices
        </div>
        <MobileResponsivenessTestingPlan />
      </div>
    </>
  );
};

export default DashboardImplementationPlan;
