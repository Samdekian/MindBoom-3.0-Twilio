
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface SessionNotesProps {
  appointmentId: string;
}

const SessionNotes: React.FC<SessionNotesProps> = ({ appointmentId }) => {
  // Mock implementation for session notes
  const notes = '';
  const setNotes = (value: string) => console.log('Setting notes:', value);
  const isLoading = false;
  const isSaving = false;
  const hasChanges = false;
  const saveNotes = () => console.log('Saving notes');
  const autoSaveEnabled = true;
  const toggleAutoSave = () => console.log('Toggling auto-save');
  const lastSavedAt = null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Session Notes</CardTitle>
            <CardDescription>
              Document your session observations and progress
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoSave}
              className="flex items-center gap-2"
            >
              {autoSaveEnabled ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
              Auto-save
            </Button>
            <Button
              onClick={saveNotes}
              disabled={!hasChanges || isSaving}
              size="sm"
            >
              {isSaving ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
        {lastSavedAt && (
          <div className="text-sm text-muted-foreground">
            Last saved: {new Date(lastSavedAt).toLocaleString()}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your session notes here..."
            className="min-h-[200px] resize-none"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved changes
                </Badge>
              )}
              {autoSaveEnabled && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Auto-save enabled
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {notes.length} characters
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionNotes;
