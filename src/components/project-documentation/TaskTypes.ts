
export type TaskStatus = "todo" | "inProgress" | "implemented" | "planned" | "blocked";
export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "authentication" | "hipaaCompliance" | "userProfile" | "security" | "documentation" | "calendar";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dependencies?: string[];
}

export const calculateProgress = (taskList: Task[]): number => {
  if (taskList.length === 0) return 0;
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter(task => task.status === "implemented").length;
  return Math.round((completedTasks / totalTasks) * 100);
};

export const getDependencyTitles = (tasks: Task[], dependencyIds?: string[]): string => {
  if (!dependencyIds || dependencyIds.length === 0) return "None";
  
  return dependencyIds.map(id => {
    const task = tasks.find(t => t.id === id);
    return task ? task.title : id;
  }).join(", ");
};
