
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import TaskFilters from "./TaskFilters";
import TasksTable from "./TasksTable";
import { Task, TaskStatus, TaskPriority, TaskCategory } from "./TaskTypes";

interface TaskTabContentProps {
  filteredTasks: Task[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: TaskStatus | "all";
  setStatusFilter: (value: TaskStatus | "all") => void;
  priorityFilter: TaskPriority | "all";
  setPriorityFilter: (value: TaskPriority | "all") => void;
  categoryFilter: TaskCategory | "all";
  setCategoryFilter: (value: TaskCategory | "all") => void;
}

const TaskTabContent: React.FC<TaskTabContentProps> = ({
  filteredTasks,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Project Tasks</CardTitle>
            <CardDescription>
              All tasks required for successful user onboarding
            </CardDescription>
          </div>
          <TaskFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
        </div>
      </CardHeader>
      <CardContent>
        <TasksTable filteredTasks={filteredTasks} />
      </CardContent>
    </Card>
  );
};

export default TaskTabContent;
