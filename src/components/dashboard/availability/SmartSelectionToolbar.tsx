
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  RotateCcw,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface SmartSelectionToolbarProps {
  selectedSlots: string[];
  totalSlots: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => Promise<void>;
  onBulkToggleAvailability: (available: boolean) => Promise<void>;
  onMarkAllAvailable: () => Promise<void>;
  onClearWeek: () => Promise<void>;
  onCopyPreviousWeek: () => Promise<void>;
  onShowSuggestions: () => void;
  onShowConflicts: () => void;
  hasConflicts: boolean;
  hasSuggestions: boolean;
}

const SmartSelectionToolbar: React.FC<SmartSelectionToolbarProps> = ({
  selectedSlots,
  totalSlots,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkToggleAvailability,
  onMarkAllAvailable,
  onClearWeek,
  onCopyPreviousWeek,
  onShowSuggestions,
  onShowConflicts,
  hasConflicts,
  hasSuggestions
}) => {
  const hasSelection = selectedSlots.length > 0;
  const allSelected = selectedSlots.length === totalSlots && totalSlots > 0;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={allSelected ? onDeselectAll : onSelectAll}
                  className="h-8 w-8 p-0"
                >
                  {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{allSelected ? 'Deselect all' : 'Select all'}</p>
              </TooltipContent>
            </Tooltip>
            
            {hasSelection && (
              <Badge variant="secondary">
                {selectedSlots.length} of {totalSlots} selected
              </Badge>
            )}
          </div>

          {/* Smart Indicators */}
          <div className="flex items-center gap-2">
            {hasConflicts && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowConflicts}
                    className="h-8 px-2 text-orange-600 hover:text-orange-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Conflicts
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show scheduling conflicts</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {hasSuggestions && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowSuggestions}
                    className="h-8 px-2 text-blue-600 hover:text-blue-700"
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Suggestions
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show smart scheduling suggestions</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Bulk Actions (shown when slots are selected) */}
          {hasSelection && (
            <div className="flex items-center gap-1 mr-2 border-r pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBulkToggleAvailability(true)}
                    className="h-8 px-2 text-green-600 hover:text-green-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Make selected slots available</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBulkToggleAvailability(false)}
                    className="h-8 px-2 text-gray-600 hover:text-gray-700"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Make selected slots unavailable</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBulkDelete}
                    className="h-8 px-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete selected slots</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAvailable}
                  className="h-8 px-2"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  All Available
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark all slots as available</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopyPreviousWeek}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Previous
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy previous week's schedule</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearWeek}
                  className="h-8 px-2 text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear Week
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all slots for this week</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SmartSelectionToolbar;
