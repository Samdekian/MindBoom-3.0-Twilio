
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SessionNoteSaveButtonProps {
  onSave: () => void;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges?: boolean;
  autoSaveEnabled?: boolean;
}

export const SessionNoteSaveButton: React.FC<SessionNoteSaveButtonProps> = ({ 
  onSave, 
  isLoading, 
  isSaving,
  hasChanges = false,
  autoSaveEnabled = false
}) => {
  return (
    <Button 
      onClick={onSave} 
      disabled={isLoading || isSaving || (!hasChanges && !autoSaveEnabled)}
      size="sm"
      variant={hasChanges ? "default" : "outline"}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      {autoSaveEnabled && !isSaving ? "Auto-saving" : "Save Notes"}
    </Button>
  );
};
