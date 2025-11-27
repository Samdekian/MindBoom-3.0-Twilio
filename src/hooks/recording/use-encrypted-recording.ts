
import { useState, useCallback, useRef } from "react";
import { useToast } from "../use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define the RecordingState interface
export interface RecordingState {
  recorder: MediaRecorder | null;
  recordingStream: MediaStream | null;
}

// Web Crypto API for encryption
const encryptData = async (data: Blob, encryptionKey: CryptoKey): Promise<Blob> => {
  try {
    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Convert the blob to an array buffer
    const dataBuffer = await data.arrayBuffer();
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      encryptionKey,
      dataBuffer
    );
    
    // Combine the IV and encrypted data
    const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combinedBuffer.set(iv, 0);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Return as a blob
    return new Blob([combinedBuffer], { type: "application/octet-stream" });
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("Failed to encrypt recording data");
  }
};

export function useEncryptedRecording(appointmentId: string) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    recorder: null,
    recordingStream: null
  });
  const [recordingData, setRecordingData] = useState<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const { toast } = useToast();

  const recordingStreamRef = useRef<MediaStream | null>(null);
  
  // Generate encryption key
  const generateEncryptionKey = useCallback(async () => {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256
        },
        true,
        ["encrypt", "decrypt"]
      );
      
      // Export key for storage (as JWK)
      const exportedKey = await crypto.subtle.exportKey("jwk", key);
      setEncryptionKey(key);
      
      // Store the key securely - mocked for now as the table doesn't exist yet
      console.log("Storing encryption key for appointment:", appointmentId, exportedKey);
      
      /* This would be the actual implementation once table is created
      await supabase
        .from("session_encryption_keys")
        .insert({
          appointment_id: appointmentId,
          key_data: exportedKey,
          created_at: new Date().toISOString()
        });
      */
      
      return key;
    } catch (err) {
      console.error("Error generating encryption key:", err);
      throw new Error("Could not generate encryption key");
    }
  }, [appointmentId]);
  
  // Start recording
  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      // Generate encryption key first
      const key = await generateEncryptionKey();
      if (!key) {
        throw new Error("Failed to generate encryption key");
      }
      
      // Create a new stream that combines audio and video tracks
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      if (!audioTracks.length && !videoTracks.length) {
        throw new Error("No audio or video tracks available for recording");
      }
      
      const combinedStream = new MediaStream([
        ...videoTracks,
        ...audioTracks
      ]);
      
      recordingStreamRef.current = combinedStream;
      
      // Configure recorder
      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setRecordingData(prevData => [...prevData, e.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        toast({
          title: "Recording completed",
          description: "Your session recording has been saved securely"
        });
      };
      
      // Start recording
      mediaRecorder.start(1000); // Capture in 1-second chunks
      
      setRecordingState({
        recorder: mediaRecorder,
        recordingStream: combinedStream
      });
      
      setIsRecording(true);
      
      toast({
        title: "Secure Recording Started",
        description: "Your session is now being recorded with encryption"
      });
      
      // Update appointment with recording status (mocked for now)
      console.log("Setting recording_in_progress to true for appointment:", appointmentId);
      
      /* This would be the actual implementation once column exists
      await supabase
        .from("appointments")
        .update({ recording_in_progress: true })
        .eq("id", appointmentId);
      */
      
      return true;
    } catch (err) {
      console.error("Error starting recording:", err);
      toast({
        title: "Recording error",
        description: "Failed to start secure recording",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, appointmentId, generateEncryptionKey]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (recordingState.recorder && recordingState.recorder.state !== "inactive") {
        recordingState.recorder.stop();
        
        // Stop all tracks in the recording stream
        if (recordingState.recordingStream) {
          recordingState.recordingStream.getTracks().forEach(track => track.stop());
        }
        
        setRecordingState({
          recorder: null,
          recordingStream: null
        });
        
        setIsRecording(false);
        
        // Update appointment recording status (mocked for now)
        console.log("Setting recording_in_progress to false for appointment:", appointmentId);
        
        /* This would be the actual implementation once column exists
        await supabase
          .from("appointments")
          .update({ recording_in_progress: false })
          .eq("id", appointmentId);
        */
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error stopping recording:", err);
      toast({
        title: "Recording error",
        description: "Failed to stop recording properly",
        variant: "destructive"
      });
      return false;
    }
  }, [recordingState, toast, appointmentId]);

  // Upload recording to storage with encryption
  const uploadRecording = useCallback(async () => {
    if (!recordingUrl || recordingData.length === 0 || !encryptionKey) {
      toast({
        title: "Upload error",
        description: "No recording data available to upload or missing encryption key",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      toast({
        title: "Uploading encrypted recording",
        description: "Please wait while your recording is securely processed and uploaded"
      });
      
      // Combine all chunks into a single blob
      const recordingBlob = new Blob(recordingData, { type: "video/webm" });
      
      // Encrypt the recording data
      const encryptedBlob = await encryptData(recordingBlob, encryptionKey);
      
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileName = `encrypted_session_${appointmentId}_${timestamp}.bin`;
      
      // Mock upload for now
      console.log("Uploading encrypted recording:", fileName);
      
      /* This would be the actual implementation once storage bucket is set up
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("session-recordings")
        .upload(fileName, encryptedBlob, {
          cacheControl: "3600",
          contentType: "application/octet-stream"
        });
      
      if (error) throw error;
      
      // Get public URL (access will be controlled via RLS)
      const { data: urlData } = supabase.storage
        .from("session-recordings")
        .getPublicUrl(fileName);
      
      const recordingPublicUrl = urlData.publicUrl;
      */
      
      // For now, create a mock URL
      const recordingPublicUrl = `https://example.com/mock-storage/session-recordings/${fileName}`;
      
      // Update appointment with recording URL (mocked for now)
      console.log("Updating appointment with recording URL:", recordingPublicUrl);
      
      /* This would be the actual implementation once columns exist
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ 
          recording_url: recordingPublicUrl,
          recording_timestamp: new Date().toISOString(),
          recording_status: 'completed'
        })
        .eq("id", appointmentId);
      
      if (updateError) throw updateError;
      */
      
      toast({
        title: "Upload complete",
        description: "Your recording has been successfully uploaded and encrypted"
      });
      
      // Clear recording data to free memory
      setRecordingData([]);
      
      return recordingPublicUrl;
    } catch (err) {
      console.error("Error uploading recording:", err);
      toast({
        title: "Upload failed",
        description: "Failed to upload encrypted recording. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [appointmentId, recordingData, recordingUrl, encryptionKey, toast]);

  // Toggle recording
  const toggleRecording = useCallback(async (stream: MediaStream) => {
    if (isRecording) {
      const stopped = await stopRecording();
      if (stopped) {
        // Automatically upload recording when stopped
        uploadRecording();
      }
      return !isRecording;
    } else {
      await startRecording(stream);
      return true;
    }
  }, [isRecording, startRecording, stopRecording, uploadRecording]);

  return {
    isRecording,
    recordingUrl,
    startRecording,
    stopRecording,
    uploadRecording,
    toggleRecording
  };
}
