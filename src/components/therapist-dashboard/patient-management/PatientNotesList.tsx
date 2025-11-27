
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Edit } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { SessionNote } from "@/types/session/note";

interface PatientNotesListProps {
  patientId: string;
  isLoading: boolean;
  notes: SessionNote[];
}

const PatientNotesList: React.FC<PatientNotesListProps> = ({
  patientId,
  isLoading,
  notes
}) => {
  const navigate = useNavigate();
  
  const handleEditNotes = (appointmentId: string) => {
    navigate(`/session/${appointmentId}/notes`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Notes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no therapy notes for this patient yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="border rounded-md p-3"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">
              {format(new Date(note.date), "MMMM d, yyyy")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditNotes(note.appointmentId)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </div>
          <p className="text-sm line-clamp-2">{note.notes}</p>
        </div>
      ))}
    </div>
  );
};

export default PatientNotesList;
