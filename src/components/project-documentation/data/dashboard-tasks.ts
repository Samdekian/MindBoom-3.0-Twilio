
import { Task } from "../TaskTypes";

export const dashboardTasks: Task[] = [
  {
    id: "dashboard-1",
    title: "Create Dashboard Layout",
    description: "Design and implement the main dashboard layout with responsive grid structure",
    status: "implemented",
    priority: "high",
    category: "documentation"
  },
  {
    id: "dashboard-2",
    title: "Implement Dashboard Header",
    description: "Create a header component with user information and quick actions",
    status: "implemented",
    priority: "medium",
    category: "documentation"
  },
  {
    id: "dashboard-3",
    title: "Add Therapist Dashboard",
    description: "Create specialized dashboard view for therapist accounts",
    status: "implemented",
    priority: "high",
    category: "documentation"
  },
  {
    id: "dashboard-4",
    title: "Implement Calendar Integration",
    description: "Enable synchronization with external calendar services",
    status: "implemented",
    priority: "high",
    category: "documentation",
    dependencies: ["dashboard-1"]
  },
  {
    id: "dashboard-5",
    title: "Unified Appointment Management",
    description: "Implemented unified AppointmentBooking component for consistent booking experience across the platform",
    status: "implemented",
    priority: "high",
    category: "documentation",
    dependencies: ["dashboard-1", "dashboard-4"]
  },
  {
    id: "dashboard-6",
    title: "Implement Google Calendar Integration",
    description: "Add OAuth-based Google Calendar synchronization for appointments",
    status: "implemented",
    priority: "medium",
    category: "documentation",
    dependencies: ["dashboard-4"]
  },
  {
    id: "dashboard-7",
    title: "Add Apple Calendar Integration",
    description: "Implement OAuth flow for Apple Calendar and two-way sync for events",
    status: "inProgress",
    priority: "medium",
    category: "documentation",
    dependencies: ["dashboard-4", "dashboard-6"]
  },
  {
    id: "dashboard-8",
    title: "Create Calendar Preferences UI",
    description: "Develop settings for notification preferences and default calendar selection",
    status: "implemented",
    priority: "medium",
    category: "documentation",
    dependencies: ["dashboard-4"]
  },
  {
    id: "dashboard-9",
    title: "Enhance Calendar Events Display",
    description: "Add support for recurring appointments, conflict detection, and calendar views",
    status: "implemented",
    priority: "low",
    category: "documentation",
    dependencies: ["dashboard-4", "dashboard-6"]
  },
  {
    id: "dashboard-10",
    title: "Implement Calendar System Improvements",
    description: "Add error handling, retry mechanisms, background sync, and performance optimizations",
    status: "inProgress",
    priority: "low",
    category: "documentation",
    dependencies: ["dashboard-4", "dashboard-6", "dashboard-7"]
  },
  {
    id: "dashboard-11",
    title: "Add Progress Metrics Widget",
    description: "Create widget showing therapy progress metrics with charts",
    status: "implemented",
    priority: "medium",
    category: "documentation",
    dependencies: ["dashboard-1"]
  },
  {
    id: "dashboard-12",
    title: "Implement Mood Tracker",
    description: "Create mood tracking functionality for patients",
    status: "implemented",
    priority: "medium",
    category: "documentation",
    dependencies: ["dashboard-1"]
  },
  {
    id: "dashboard-13",
    title: "Add Resources Widget",
    description: "Add widget with mental health resources and articles",
    status: "implemented",
    priority: "low",
    category: "documentation",
    dependencies: ["dashboard-1"]
  },
  {
    id: "dashboard-14",
    title: "Implement Quick Actions",
    description: "Add quick action buttons for common tasks",
    status: "implemented",
    priority: "low",
    category: "documentation",
    dependencies: ["dashboard-1"]
  }
];
