
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from "@/components/HipaaTimeline";

interface TimelineTask {
  title: string;
  isCompleted: boolean;
}

interface TimelinePhaseProps {
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  description: string;
  tasks: TimelineTask[];
  isLast?: boolean;
}

const TimelinePhase: React.FC<TimelinePhaseProps> = ({
  title,
  status,
  description,
  tasks,
  isLast = false,
}) => {
  const isDone = status === "completed";
  const isInProgress = status === "in-progress";

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot className={isDone ? "bg-green-500" : "bg-blue-500"}>
          {isDone ? <CheckCircle2 size={20} /> : <Clock size={20} />}
        </TimelineDot>
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tasks.map((task, index) => (
            <Badge
              key={index}
              variant="outline"
              className={
                task.isCompleted
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }
            >
              {task.isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Clock className="h-3.5 w-3.5 mr-1" />
              )}
              {task.title}
            </Badge>
          ))}
        </div>
      </TimelineContent>
    </TimelineItem>
  );
};

export default TimelinePhase;
