
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Task } from "./TaskTypes";
import { CategoryIcon, StatusBadge, PriorityBadge } from "./TaskBadges";
import { getDependencyTitles, tasks } from "./TasksData";

interface TasksTableProps {
  filteredTasks: Task[];
}

const TasksTable: React.FC<TasksTableProps> = ({ filteredTasks }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Category</TableHead>
            <TableHead className="max-w-[300px]">Task</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="max-w-[200px]">Dependencies</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No tasks found matching the current filters
              </TableCell>
            </TableRow>
          ) : (
            filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <CategoryIcon category={task.category} />
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getDependencyTitles(tasks, task.dependencies)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TasksTable;
