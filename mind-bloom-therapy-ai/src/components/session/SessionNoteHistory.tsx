
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export interface SessionNote {
  id: string;
  appointment_id: string;
  created_by: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  appointment?: {
    title: string;
    start_time: string;
    patient_id?: string;
  };
}

interface SessionNoteHistoryProps {
  patientId: string;
}

export const SessionNoteHistory: React.FC<SessionNoteHistoryProps> = ({ patientId }) => {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!patientId) return;
    
    const fetchNoteHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('session_notes')
          .select(`
            id,
            appointment_id,
            created_by,
            content,
            created_at,
            updated_at,
            appointment:appointments!inner (
              title,
              start_time,
              patient_id
            )
          `)
          .eq('appointment.patient_id', patientId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform the data to match the SessionNote interface
        const formattedNotes: SessionNote[] = (data || []).map(note => {
          // Ensure appointment is handled as an object, not an array
          const appointmentData = note.appointment && typeof note.appointment === 'object' 
            ? (Array.isArray(note.appointment) ? note.appointment[0] : note.appointment)
            : { title: '', start_time: '', patient_id: undefined };
            
          return {
            id: note.id,
            appointment_id: note.appointment_id,
            created_by: note.created_by,
            content: note.content,
            created_at: note.created_at,
            updated_at: note.updated_at,
            appointment: {
              title: appointmentData.title || '',
              start_time: appointmentData.start_time || '',
              patient_id: appointmentData.patient_id
            }
          };
        });
        
        setNotes(formattedNotes);
      } catch (err) {
        console.error("Error fetching note history:", err);
        toast({
          title: "Error",
          description: "Failed to load session note history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNoteHistory();
  }, [patientId, toast]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Note History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No session notes found for this patient.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Note History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notes.map(note => (
          <div key={note.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{note.appointment?.title || 'Untitled Session'}</h3>
              <span className="text-sm text-muted-foreground">
                {note.appointment?.start_time ? format(new Date(note.appointment.start_time), "MMM d, yyyy") : 
                  note.created_at ? format(new Date(note.created_at), "MMM d, yyyy") : ''}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm">
              {note.content}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Last updated: {(note.updated_at || note.created_at) ? 
                format(new Date(note.updated_at || note.created_at || ''), "MMM d, yyyy 'at' h:mm a") : ''}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SessionNoteHistory;
