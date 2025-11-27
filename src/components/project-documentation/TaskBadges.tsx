
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, CalendarClock, AlertCircle, Users, Shield, LockKeyhole, FileText, Calendar } from "lucide-react";
import { TaskStatus, TaskPriority, TaskCategory } from "./TaskTypes";

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case "implemented":
      return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Implemented</Badge>;
    case "inProgress":
      return <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1"><Clock className="h-3 w-3" /> In Progress</Badge>;
    case "planned":
      return <Badge className="bg-gray-500 hover:bg-gray-600 flex items-center gap-1"><CalendarClock className="h-3 w-3" /> Planned</Badge>;
    case "blocked":
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Blocked</Badge>;
    default:
      return null;
  }
};

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  switch (priority) {
    case "high":
      return <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1">High</Badge>;
    case "medium":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500 flex items-center gap-1">Medium</Badge>;
    case "low":
      return <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">Low</Badge>;
    default:
      return null;
  }
};

export const CategoryIcon = ({ category }: { category: TaskCategory }) => {
  switch (category) {
    case "authentication":
      return <Users className="h-4 w-4 text-blue-500" />;
    case "hipaaCompliance":
      return <Shield className="h-4 w-4 text-purple-500" />;
    case "userProfile":
      return <Users className="h-4 w-4 text-green-500" />;
    case "security":
      return <LockKeyhole className="h-4 w-4 text-red-500" />;
    case "documentation":
      return <FileText className="h-4 w-4 text-amber-500" />;
    case "calendar":
      return <Calendar className="h-4 w-4 text-blue-400" />;
    default:
      return null;
  }
};
