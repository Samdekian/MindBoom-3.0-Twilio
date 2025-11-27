
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface DurationTemplate {
  minutes: number;
  label: string;
  description: string;
  color: string;
}

const DURATION_TEMPLATES: DurationTemplate[] = [
  { minutes: 30, label: "30min", description: "Quick session", color: "bg-blue-100 text-blue-800" },
  { minutes: 45, label: "45min", description: "Standard session", color: "bg-green-100 text-green-800" },
  { minutes: 60, label: "60min", description: "Full session", color: "bg-purple-100 text-purple-800" },
  { minutes: 90, label: "90min", description: "Extended session", color: "bg-orange-100 text-orange-800" }
];

interface DurationTemplateSelectorProps {
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  showLabels?: boolean;
}

const DurationTemplateSelector: React.FC<DurationTemplateSelectorProps> = ({
  selectedDuration,
  onDurationChange,
  showLabels = true
}) => {
  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="h-4 w-4" />
          Duration Templates
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {DURATION_TEMPLATES.map((template) => (
          <Button
            key={template.minutes}
            variant={selectedDuration === template.minutes ? "default" : "outline"}
            size="sm"
            onClick={() => onDurationChange(template.minutes)}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={`text-xs ${template.color} border-0`}
            >
              {template.label}
            </Badge>
            {showLabels && (
              <span className="hidden sm:inline text-xs">
                {template.description}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DurationTemplateSelector;
