
import { Task } from "../TaskTypes";

export const securityTasks: Task[] = [
  {
    id: "security-1",
    title: "Role-Based Access Control",
    description: "Implement role-based access control for different user types",
    status: "implemented",
    priority: "high",
    category: "security",
  },
  {
    id: "security-2",
    title: "Two-Factor Authentication",
    description: "Add two-factor authentication option for accounts",
    status: "implemented",
    priority: "high",
    category: "security",
  },
  {
    id: "security-3",
    title: "Security Audit Tools",
    description: "Create security audit tools for admin users",
    status: "implemented",
    priority: "medium",
    category: "security",
    dependencies: ["security-1"]
  },
  {
    id: "security-4",
    title: "Session Timeout",
    description: "Implement session timeout for inactive users",
    status: "implemented",
    priority: "medium",
    category: "security",
  },
  {
    id: "security-5",
    title: "Password Policies",
    description: "Enforce strong password policies",
    status: "implemented",
    priority: "high",
    category: "security",
  },
  {
    id: "security-6",
    title: "HIPAA Compliance Documentation",
    description: "Document HIPAA compliance measures",
    status: "implemented",
    priority: "high",
    category: "security",
  },
  {
    id: "security-7",
    title: "Data Encryption",
    description: "Implement end-to-end encryption for sensitive data",
    status: "implemented",
    priority: "high",
    category: "security",
  },
  {
    id: "security-8",
    title: "Security Monitoring Dashboard",
    description: "Create dashboard for security monitoring and compliance",
    status: "implemented",
    priority: "medium",
    category: "security",
    dependencies: ["security-3"]
  },
  {
    id: "security-9",
    title: "Security Event Logging",
    description: "Enhance logging for security events and anomalies",
    status: "implemented",
    priority: "high",
    category: "security",
  },
  {
    id: "security-10",
    title: "Role Consistency Checks",
    description: "Implement automated role consistency verification",
    status: "implemented",
    priority: "medium",
    category: "security",
    dependencies: ["security-1", "security-3"]
  },
  {
    id: "security-11",
    title: "Authentication Rate Limiting",
    description: "Add rate limiting for authentication attempts",
    status: "implemented",
    priority: "high",
    category: "security",
  }
];
