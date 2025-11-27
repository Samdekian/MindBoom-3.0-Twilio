
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Undo2, Redo2, History } from "lucide-react";
import { useUndoRedo } from "@/hooks/use-undo-redo";

interface UndoRedoToolbarProps {
  undoRedoActions: ReturnType<typeof useUndoRedo>;
}

const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  undoRedoActions
}) => {
  const { undo, redo, canUndo, canRedo, getCurrentAction, history } = undoRedoActions;

  const handleUndo = async () => {
    try {
      await undo();
    } catch (error) {
      console.error('Undo failed:', error);
    }
  };

  const handleRedo = async () => {
    try {
      await redo();
    } catch (error) {
      console.error('Redo failed:', error);
    }
  };

  const currentAction = getCurrentAction();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="h-8 w-8 p-0"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {canUndo 
                  ? `Undo: ${currentAction?.description || 'Last action'}` 
                  : 'Nothing to undo'
                }
              </p>
              <p className="text-xs text-gray-500">Ctrl+Z</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="h-8 w-8 p-0"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {canRedo 
                  ? 'Redo next action' 
                  : 'Nothing to redo'
                }
              </p>
              <p className="text-xs text-gray-500">Ctrl+Y</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {history.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <History className="h-3 w-3" />
            {history.length} action{history.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
};

export default UndoRedoToolbar;
