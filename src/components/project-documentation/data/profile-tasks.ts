
import { Task } from "../TaskTypes";

export const profileTasks: Task[] = [
  {
    id: "profile-1",
    title: "Profile Management",
    description: "Allow users to view and edit their profile information",
    status: "implemented",
    priority: "medium",
    category: "userProfile",
  },
  {
    id: "profile-2",
    title: "Avatar/Photo Upload",
    description: "Allow users to upload profile pictures",
    status: "planned",
    priority: "low",
    category: "userProfile",
    dependencies: ["profile-1"]
  },
  {
    id: "profile-3",
    title: "User Preferences",
    description: "Allow users to set notification preferences",
    status: "planned",
    priority: "low",
    category: "userProfile",
    dependencies: ["profile-1"]
  },
  {
    id: "profile-4",
    title: "Activity History View",
    description: "Implement a view for users to see their recent activity",
    status: "implemented",
    priority: "medium", 
    category: "userProfile",
    dependencies: ["profile-1"]
  },
  {
    id: "profile-5",
    title: "Profile Tabs Interface",
    description: "Create tabbed interface for profile information, account type, and activity",
    status: "implemented",
    priority: "high",
    category: "userProfile"
  },
];
