
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/HipaaTimeline";
import TimelinePhase from "./timeline/TimelinePhase";

const ImplementationTimeline: React.FC = () => {
  const phases = [
    {
      title: "Phase 1: Core Implementation",
      status: "completed" as const,
      description: "Already completed",
      tasks: [
        { title: "Authentication", isCompleted: true },
        { title: "Data Encryption", isCompleted: true },
        { title: "HIPAA Consent", isCompleted: true },
      ],
    },
    {
      title: "Phase 2: Enhanced Security",
      status: "in-progress" as const,
      description: "In progress (2 weeks remaining)",
      tasks: [
        { title: "Audit Logging", isCompleted: false },
        { title: "Role-based Access", isCompleted: false },
        { title: "Security Assessment", isCompleted: false },
      ],
    },
    {
      title: "Phase 3: User Experience & Documentation",
      status: "completed" as const,
      description: "Completed",
      tasks: [
        { title: "User Profiles", isCompleted: true },
        { title: "User Guide", isCompleted: true },
        { title: "Admin Documentation", isCompleted: true },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementation Timeline</CardTitle>
        <CardDescription>
          Projected timeline for completing remaining tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline>
          {phases.map((phase, index) => (
            <TimelinePhase
              key={index}
              title={phase.title}
              status={phase.status}
              description={phase.description}
              tasks={phase.tasks}
              isLast={index === phases.length - 1}
            />
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default ImplementationTimeline;
