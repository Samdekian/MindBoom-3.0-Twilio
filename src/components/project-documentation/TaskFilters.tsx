
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ListFilter } from "lucide-react";
import { TaskStatus, TaskPriority, TaskCategory } from "./TaskTypes";

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: TaskStatus | "all";
  setStatusFilter: (value: TaskStatus | "all") => void;
  priorityFilter: TaskPriority | "all";
  setPriorityFilter: (value: TaskPriority | "all") => void;
  categoryFilter: TaskCategory | "all";
  setCategoryFilter: (value: TaskCategory | "all") => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
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
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[200px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <ListFilter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="max-w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
          <SelectTrigger className="max-w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <ListFilter className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
          <SelectTrigger className="max-w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="authentication">Authentication</SelectItem>
            <SelectItem value="hipaaCompliance">HIPAA Compliance</SelectItem>
            <SelectItem value="userProfile">User Profile</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="documentation">Documentation</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilters;
