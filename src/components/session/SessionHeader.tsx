
import React from "react";
import { Badge } from "@/components/ui/badge";

interface SessionHeaderProps {
  title: string;
  isCompleted: boolean;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ title, isCompleted }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Badge className={isCompleted ? "bg-green-600" : "bg-blue-600"}>
        {isCompleted ? "Completed" : "Active"}
      </Badge>
    </div>
  );
};

export default SessionHeader;
