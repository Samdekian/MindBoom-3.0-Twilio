
import React from "react";
import TaskTabContent from "@/components/project-documentation/TaskTabContent";
import { Task, TaskStatus, TaskPriority, TaskCategory } from "@/components/project-documentation/TaskTypes";

interface Props {
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

const TaskManagementSection: React.FC<Props> = ({
  filteredTasks,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
}) => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold mb-4">Task Management</h2>
    <TaskTabContent 
      filteredTasks={filteredTasks}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      priorityFilter={priorityFilter}
      setPriorityFilter={setPriorityFilter}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
    />
  </section>
);

export default TaskManagementSection;
