
import React from "react";
import { AlertTriangle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No role events found",
  description = "No role history events match your current filters"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
