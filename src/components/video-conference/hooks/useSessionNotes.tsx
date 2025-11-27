
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

export function useSessionNotes(appointmentId: string, isTherapist: boolean) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuthRBAC();

  // Track changes to notes
  useEffect(() => {
    if (notes.trim().length > 0) {
      setHasChanges(true);
    }
  }, [notes]);

  // Load notes on component mount
  useEffect(() => {
    if (!appointmentId) return;
    
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would load notes from the database
        // For now we just simulate a loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading notes:", error);
        setIsLoading(false);
      }
    };
    
    loadNotes();
  }, [appointmentId]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasChanges || !isTherapist) return;

    const timer = setTimeout(() => {
      saveNotes();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(timer);
  }, [notes, autoSaveEnabled, hasChanges, isTherapist]);

  const toggleAutoSave = () => {
    setAutoSaveEnabled(prev => !prev);
  };

  // Make sure saveNotes returns Promise<void> not Promise<boolean>
  const saveNotes = async (): Promise<void> => {
    if (!isTherapist || !notes.trim()) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, we would save the notes to the database
      // For now we'll just show a success toast after a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLastSavedAt(new Date());
      setHasChanges(false);
      
      toast({
        title: "Notes Saved",
        description: "Your session notes have been securely saved",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { 
    notes, 
    setNotes, 
    saveNotes, 
    isLoading, 
    isSaving, 
    hasChanges, 
    autoSaveEnabled, 
    toggleAutoSave, 
    lastSavedAt 
  };
}
