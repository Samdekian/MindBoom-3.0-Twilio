
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Calendar } from "lucide-react";
import { tasks, calculateProgress } from "./TasksData";
import { Task } from "./TaskTypes";

type CategoryTasksMap = Record<string, Task[]>;

interface ProgressCardsProps {
  tasksByCategory: CategoryTasksMap;
}

const ProgressCards: React.FC<ProgressCardsProps> = ({ tasksByCategory }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={calculateProgress(tasks)} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {tasks.filter(t => t.status === "implemented").length} of {tasks.length} tasks completed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">HIPAA Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={calculateProgress(tasks.filter(t => t.category === "hipaaCompliance"))} 
              className="h-2" 
            />
            <p className="text-sm text-muted-foreground">
              {tasksByCategory.hipaaCompliance.filter(t => t.status === "implemented").length} of {tasksByCategory.hipaaCompliance.length} tasks completed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={calculateProgress(tasks.filter(t => t.category === "calendar"))} 
              className="h-2" 
            />
            <p className="text-sm text-muted-foreground">
              {tasksByCategory.calendar.filter(t => t.status === "implemented").length} of {tasksByCategory.calendar.length} tasks completed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">High Priority Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              <span className="text-xl font-bold">
                {tasks.filter(t => t.priority === "high" && t.status !== "implemented").length}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              remaining
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressCards;
