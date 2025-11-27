
import { useCallback } from "react";

export const useRecordingStorage = (
  appointmentId: string,
  toast: any
) => {
  const downloadRecording = useCallback((recordingUrl: string | null) => {
    if (recordingUrl) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = recordingUrl;
      a.download = `recording-${appointmentId}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your recording is being downloaded",
        variant: "success",
      });
      
      return true;
    }
    return false;
  }, [appointmentId, toast]);

  const saveRecordingMetadata = useCallback(async (
    blob: Blob, 
    url: string
  ) => {
    try {
      console.log(`Recording saved for appointment ${appointmentId}`);
      // Commented out database operations
      /* 
      // This would be the actual implementation if we had a session_recordings table
      // We need to create this table first in Supabase before uncommenting
      const { error } = await supabase.from("session_recordings").insert({
        appointment_id: appointmentId,
        recording_url: url, // In real app, this would be the storage URL
        duration_seconds: Math.floor(blob.size / 100000), // Simplified calculation
        file_size_bytes: blob.size,
      });
      
      if (error) {
        console.error("Error saving recording metadata:", error);
      }
      */
    } catch (error) {
      console.error("Error saving recording metadata:", error);
    }
  }, [appointmentId]);

  return {
    downloadRecording,
    saveRecordingMetadata
  };
};
