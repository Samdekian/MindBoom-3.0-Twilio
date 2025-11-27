
import { useState, useCallback } from 'react';

export interface UseSessionNotesReturn {
  notes: string;
  setNotes: (notes: string) => void;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  saveNotes: () => void;
  autoSaveEnabled: boolean;
  toggleAutoSave: () => void;
  lastSavedAt: Date | null;
  error: Error | null;
}

export function useSessionNotes(appointmentId: string): UseSessionNotesReturn {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const saveNotes = useCallback(() => {
    setIsSaving(true);
    // Mock save implementation
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      setLastSavedAt(new Date());
    }, 1000);
  }, []);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  return {
    notes,
    setNotes,
    isLoading,
    isSaving,
    hasChanges,
    saveNotes,
    autoSaveEnabled,
    toggleAutoSave,
    lastSavedAt,
    error,
  };
}
