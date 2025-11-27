
import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { tasks } from "@/components/project-documentation/data/tasks";
import { TaskStatus, TaskPriority, TaskCategory } from "@/components/project-documentation/TaskTypes";

import HeaderSection from "./project-documentation/HeaderSection";
import ProgressOverviewSection from "./project-documentation/ProgressOverviewSection";
import ImplementationRoadmapSection from "./project-documentation/ImplementationRoadmapSection";
import TaskManagementSection from "./project-documentation/TaskManagementSection";
import DashboardSection from "./project-documentation/DashboardSection";
import PerformanceOptimizationSection from "./project-documentation/PerformanceOptimizationSection";
import DocumentsSection from "./project-documentation/DocumentsSection";
import RBACImplementationSection from "./project-documentation/RBACImplementationSection";

const ProjectDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const tasksByCategory = useMemo(() => {
    const grouped: Record<TaskCategory, any[]> = {
      authentication: [],
      hipaaCompliance: [],
      userProfile: [],
      security: [],
      documentation: [],
      calendar: [], 
    };
    filteredTasks.forEach(task => {
      grouped[task.category].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <HeaderSection />
        <div className="space-y-12">
          <ProgressOverviewSection tasksByCategory={tasksByCategory} />
          <RBACImplementationSection />
          <ImplementationRoadmapSection tasksByCategory={tasksByCategory} />
          <TaskManagementSection
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
          <DashboardSection />
          <PerformanceOptimizationSection />
          <DocumentsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDocumentation;
