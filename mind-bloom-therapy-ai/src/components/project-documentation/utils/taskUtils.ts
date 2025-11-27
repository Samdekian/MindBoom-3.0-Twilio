
import { Task } from "../TaskTypes";
import { tasks } from "../data/tasks";

export const calculateProgress = (taskList: Task[]): number => {
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter(task => task.status === "implemented").length;
  return Math.round((completedTasks / totalTasks) * 100);
};

export const getDependencyTitles = (dependencyIds?: string[]): string => {
  if (!dependencyIds || dependencyIds.length === 0) return "None";
  
  return dependencyIds.map(id => {
    const task = tasks.find(t => t.id === id);
    return task ? task.title : id;
  }).join(", ");
};
