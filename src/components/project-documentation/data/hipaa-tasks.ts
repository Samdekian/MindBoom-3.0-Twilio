
import { Task } from "../TaskTypes";

export const hipaaTasks: Task[] = [
  {
    id: "hipaa-1",
    title: "Data Encryption",
    description: "Ensure all PHI is encrypted in transit and at rest",
    status: "implemented",
    priority: "high",
    category: "hipaaCompliance",
  },
  {
    id: "hipaa-2",
    title: "Access Control Implementation",
    description: "Role-based access controls for PHI",
    status: "implemented",
    priority: "high",
    category: "hipaaCompliance",
  },
  {
    id: "hipaa-3",
    title: "Audit Logging",
    description: "Implement comprehensive audit logs for all PHI access",
    status: "inProgress",
    priority: "high",
    category: "hipaaCompliance",
  },
  {
    id: "hipaa-4",
    title: "Backup & Recovery",
    description: "Implement secure backups and disaster recovery",
    status: "planned",
    priority: "medium",
    category: "hipaaCompliance",
    dependencies: ["hipaa-1"]
  },
  {
    id: "hipaa-5",
    title: "Security Risk Assessment",
    description: "Conduct security risk assessment",
    status: "inProgress",
    priority: "medium",
    category: "hipaaCompliance",
  },
  {
    id: "hipaa-6",
    title: "HIPAA Consent Management",
    description: "Implement comprehensive HIPAA consent process with user-friendly dialog and tracking",
    status: "implemented",
    priority: "high",
    category: "hipaaCompliance",
    dependencies: ["hipaa-1", "hipaa-2"]
  },
  {
    id: "hipaa-7",
    title: "Video Conference Compliance",
    description: "Implement HIPAA-compliant video conferencing with encryption, access controls, and audit logging",
    status: "implemented",
    priority: "high",
    category: "hipaaCompliance",
    dependencies: ["hipaa-1", "hipaa-2", "hipaa-6"]
  },
];
