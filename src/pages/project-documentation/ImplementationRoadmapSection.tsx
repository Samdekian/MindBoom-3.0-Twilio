
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImplementationTimeline from "@/components/project-documentation/ImplementationTimeline";
import TasksByCategory from "@/components/project-documentation/TasksByCategory";
import { Task } from "@/components/project-documentation/TaskTypes";

interface Props {
  tasksByCategory: Record<string, Task[]>;
}

const ImplementationRoadmapSection: React.FC<Props> = ({ tasksByCategory }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold mb-4">Implementation Roadmap</h2>
    <Tabs defaultValue="timeline" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="timeline">Implementation Timeline</TabsTrigger>
        <TabsTrigger value="categories">Tasks by Category</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">
        <ImplementationTimeline />
      </TabsContent>
      <TabsContent value="categories">
        <TasksByCategory tasksByCategory={tasksByCategory} />
      </TabsContent>
    </Tabs>
  </section>
);

export default ImplementationRoadmapSection;
