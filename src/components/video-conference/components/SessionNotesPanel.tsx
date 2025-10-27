import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  X, 
  Save,
  Clock,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SessionNote {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  isPrivate?: boolean;
}

interface SessionNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  isTherapist: boolean;
  currentUserName: string;
}

const SessionNotesPanel: React.FC<SessionNotesPanelProps> = ({
  isOpen,
  onClose,
  sessionId,
  isTherapist,
  currentUserName
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSaveNote = () => {
    if (!currentNote.trim()) return;

    const note: SessionNote = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: new Date(),
      author: currentUserName,
      isPrivate: isPrivate && isTherapist
    };

    setNotes(prev => [...prev, note]);
    setCurrentNote("");
    
    toast({
      title: "Note saved",
      description: isPrivate ? "Private note saved to session" : "Note saved to session",
      duration: 2000
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed top-4 left-4 w-96 h-96 z-50 shadow-2xl border-2">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Session Notes
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-80">
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Add notes during the session</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">{note.author}</span>
                    {note.isPrivate && (
                      <Badge variant="secondary" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(note.timestamp)}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t p-3 space-y-3">
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Add a note about this session..."
            className="resize-none text-sm"
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            {isTherapist && (
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                <span>Private note (therapist only)</span>
              </label>
            )}
            
            <Button 
              onClick={handleSaveNote}
              disabled={!currentNote.trim()}
              size="sm"
              className="ml-auto"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionNotesPanel;