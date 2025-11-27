
import { Task } from "../TaskTypes";

export const calendarTasks: Task[] = [
  {
    id: "calendar-1",
    title: "Calendar Service Integration",
    description: "Create core integration with calendar services (Google, Apple)",
    status: "inProgress",
    priority: "high",
    category: "calendar"
  },
  {
    id: "calendar-2",
    title: "Google Calendar OAuth",
    description: "Implement OAuth authentication flow for Google Calendar",
    status: "implemented",
    priority: "high",
    category: "calendar",
    dependencies: ["calendar-1"]
  },
  {
    id: "calendar-3",
    title: "Apple Calendar OAuth",
    description: "Implement OAuth authentication flow for Apple Calendar",
    status: "inProgress",
    priority: "medium",
    category: "calendar",
    dependencies: ["calendar-1"]
  },
  {
    id: "calendar-4",
    title: "Two-way Event Synchronization",
    description: "Enable bidirectional sync of events between MindBloom and calendar services",
    status: "implemented",
    priority: "high",
    category: "calendar",
    dependencies: ["calendar-2"]
  },
  {
    id: "calendar-5",
    title: "Calendar Notification Preferences",
    description: "Allow users to set preferences for calendar event notifications",
    status: "implemented",
    priority: "medium",
    category: "calendar",
    dependencies: ["calendar-1"]
  },
  {
    id: "calendar-6",
    title: "Calendar Event Conflict Detection",
    description: "Implement system to detect and prevent scheduling conflicts",
    status: "implemented",
    priority: "medium", 
    category: "calendar",
    dependencies: ["calendar-4"]
  },
  {
    id: "calendar-7",
    title: "Recurring Appointments",
    description: "Add support for recurring therapy appointments in calendar",
    status: "implemented",
    priority: "low",
    category: "calendar",
    dependencies: ["calendar-4"]
  },
  {
    id: "calendar-8",
    title: "Multiple Calendar View",
    description: "Create day/week/month calendar views for appointments",
    status: "implemented",
    priority: "low",
    category: "calendar",
    dependencies: ["calendar-1"]
  },
  {
    id: "calendar-9",
    title: "Background Calendar Sync",
    description: "Implement automatic background synchronization of calendar events",
    status: "inProgress",
    priority: "medium",
    category: "calendar",
    dependencies: ["calendar-2", "calendar-3", "calendar-4"]
  },
  {
    id: "calendar-10",
    title: "Calendar API Error Handling",
    description: "Improve error handling and retry mechanisms for calendar API failures",
    status: "implemented",
    priority: "medium",
    category: "calendar",
    dependencies: ["calendar-2", "calendar-3"]
  },
  {
    id: "calendar-11",
    title: "Appointment Booking Component Refactoring",
    description: "Refactored appointment booking flow to use a unified AppointmentBooking component across the application",
    status: "implemented",
    priority: "high",
    category: "calendar",
    dependencies: ["calendar-1", "calendar-4"]
  },
  {
    id: "calendar-12",
    title: "Multi-Calendar Support",
    description: "Allow users to select from multiple calendars within their accounts",
    status: "implemented",
    priority: "low",
    category: "calendar",
    dependencies: ["calendar-2", "calendar-3"]
  },
  {
    id: "calendar-13",
    title: "Booking UX Improvements",
    description: "Enhanced appointment booking with loading states, error handling, and better user feedback",
    status: "implemented",
    priority: "high",
    category: "calendar",
    dependencies: ["calendar-11"]
  }
];
