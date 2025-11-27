
import { Task } from "../TaskTypes";

export const authTasks: Task[] = [
  {
    id: "auth-1",
    title: "User Registration Flow",
    description: "Implement user registration with email verification",
    status: "implemented",
    priority: "high",
    category: "authentication",
  },
  {
    id: "auth-2",
    title: "Login System",
    description: "Implement secure login with password protection",
    status: "implemented",
    priority: "high",
    category: "authentication",
  },
  {
    id: "auth-3",
    title: "Password Reset",
    description: "Allow users to reset their password securely",
    status: "implemented",
    priority: "medium",
    category: "authentication",
  },
  {
    id: "auth-4",
    title: "Role-based Access Controls",
    description: "Implement different user roles (admin, patient, provider)",
    status: "inProgress",
    priority: "high",
    category: "authentication",
    dependencies: ["auth-1"]
  },
];
