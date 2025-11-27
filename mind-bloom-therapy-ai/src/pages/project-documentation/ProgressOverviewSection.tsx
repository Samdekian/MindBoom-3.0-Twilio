
import React from "react";
import ProgressCards from "@/components/project-documentation/ProgressCards";
import { Task } from "@/components/project-documentation/TaskTypes";

interface Props {
  tasksByCategory: Record<string, Task[]>;
}

const ProgressOverviewSection: React.FC<Props> = ({ tasksByCategory }) => (
  <section className="mb-12">
    <ProgressCards tasksByCategory={tasksByCategory} />
  </section>
);

export default ProgressOverviewSection;
