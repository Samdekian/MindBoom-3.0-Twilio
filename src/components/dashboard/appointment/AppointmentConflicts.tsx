
import React from "react";
import { AlertTriangle } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { format } from "date-fns";

interface Conflict {
  conflict_id: string;
  event_summary: string;
  conflict_start: string;
  conflict_end: string;
}

interface AppointmentConflictsProps {
  conflicts: Conflict[];
}

const AppointmentConflicts = ({ conflicts }: AppointmentConflictsProps) => {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-2">
      <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span>
          {conflicts.length === 1 
            ? "This appointment has a scheduling conflict" 
            : `This appointment has ${conflicts.length} scheduling conflicts`}
        </span>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="conflicts">
          <AccordionTrigger className="text-sm text-amber-700 py-2">
            View {conflicts.length === 1 ? "conflict" : "all conflicts"}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {conflicts.map((conflict, index) => (
                <li 
                  key={conflict.conflict_id || index} 
                  className="text-sm border-l-2 border-amber-400 pl-3 py-1"
                >
                  <div className="font-medium">{conflict.event_summary || "Untitled event"}</div>
                  <div className="text-amber-700">
                    {format(new Date(conflict.conflict_start), "MMM d, h:mm a")} - 
                    {format(new Date(conflict.conflict_end), "h:mm a")}
                  </div>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AppointmentConflicts;
