
import React from "react";
import ProjectDocuments from "@/components/project-documentation/ProjectDocuments";
import CalendarImplementationPlan from "@/components/project-documentation/CalendarImplementationPlan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentsSection: React.FC = () => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold mb-4">Project Documents</h2>
    
    <Tabs defaultValue="project" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="project">Project Documentation</TabsTrigger>
        <TabsTrigger value="calendar">Calendar Integration</TabsTrigger>
      </TabsList>
      
      <TabsContent value="project">
        <ProjectDocuments />
      </TabsContent>
      
      <TabsContent value="calendar">
        <CalendarImplementationPlan />
      </TabsContent>
    </Tabs>
  </section>
);

export default DocumentsSection;
