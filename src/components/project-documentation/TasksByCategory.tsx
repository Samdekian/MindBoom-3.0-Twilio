
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, CalendarClock, Shield, Users, LockKeyhole, FileText, Calendar } from "lucide-react";
import { Task } from "./TaskTypes";
import { PriorityBadge } from "./TaskBadges";
import { calculateProgress } from "./TasksData";

interface TasksByCategoryProps {
  tasksByCategory: Record<string, Task[]>;
}

const TasksByCategory: React.FC<TasksByCategoryProps> = ({ tasksByCategory }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <CardTitle>HIPAA Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryContent 
            tasks={tasksByCategory.hipaaCompliance} 
            category="hipaaCompliance" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryContent 
            tasks={tasksByCategory.authentication} 
            category="authentication" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <LockKeyhole className="h-5 w-5 text-red-500" />
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryContent 
            tasks={tasksByCategory.security} 
            category="security" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Users className="h-5 w-5 text-green-500" />
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryContent 
            tasks={tasksByCategory.userProfile} 
            category="userProfile" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <FileText className="h-5 w-5 text-amber-500" />
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryContent 
            tasks={tasksByCategory.documentation} 
            category="documentation" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryContent 
            tasks={tasksByCategory.calendar} 
            category="calendar" 
          />
        </CardContent>
      </Card>
    </div>
  );
};

interface CategoryContentProps {
  tasks: Task[];
  category: string;
}

const CategoryContent: React.FC<CategoryContentProps> = ({ tasks, category }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Progress</span>
          <span className="font-medium">
            {calculateProgress(tasks)}%
          </span>
        </div>
        <Progress 
          value={calculateProgress(tasks)} 
        />
      </div>
      <ul className="space-y-1">
        {tasks.map(task => (
          <li key={task.id} className="flex justify-between items-center text-sm py-1">
            <span className="flex items-center gap-2">
              {task.status === "implemented" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : task.status === "inProgress" ? (
                <Clock className="h-4 w-4 text-blue-500" />
              ) : (
                <CalendarClock className="h-4 w-4 text-gray-500" />
              )}
              {task.title}
            </span>
            <PriorityBadge priority={task.priority} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TasksByCategory;
