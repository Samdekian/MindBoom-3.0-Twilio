
import { useState, useCallback } from "react";
import { RecordingState } from "./types";

export function useRecordingHandler() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    recordedChunks: [],
    mediaRecorder: null,
    startTime: 0,
    error: null,
    recorder: null,
    recordingStream: null,
    savedRecordings: []
  });

  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      const savedRecordings: (string | Blob)[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          savedRecordings.push(event.data);
        }
      };

      recorder.onstop = () => {
        setRecordingState(prev => ({
          ...prev,
          recordingStream: null
        }));
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder Error: ", event);
        setRecordingState(prev => ({
          ...prev,
          error: new Error("MediaRecorder error occurred."),
          isRecording: false,
          recorder: null,
          recordingStream: null
        }));
      };

      recorder.start();

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        recordedChunks: [],
        mediaRecorder: recorder,
        startTime: Date.now(),
        error: null,
        recorder: recorder,
        recordingStream: stream,
        savedRecordings: []
      });

      return true;
    } catch (error: any) {
      console.error("Error starting recording:", error);
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        recordedChunks: [],
        mediaRecorder: null,
        startTime: 0,
        error: error instanceof Error ? error : new Error("Failed to start recording."),
        recorder: null,
        recordingStream: null,
        savedRecordings: []
      });
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingState.recorder) {
      console.warn("No active recorder to stop.");
      return false;
    }

    try {
      recordingState.recorder.stop();
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        recorder: null
      }));
      return true;
    } catch (error: any) {
      console.error("Error stopping recording:", error);
      setRecordingState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to stop recording."),
        isRecording: false,
        recorder: null
      }));
      return false;
    }
  }, [recordingState.recorder]);

  const downloadRecording = useCallback(async () => {
    if (!recordingState.savedRecordings || recordingState.savedRecordings.length === 0) {
      console.warn("No recordings available to download.");
      return null;
    }

    try {
      const blob = new Blob(recordingState.savedRecordings, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return url;
    } catch (error: any) {
      console.error("Error downloading recording:", error);
      setRecordingState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to download recording.")
      }));
      return null;
    }
  }, [recordingState.savedRecordings]);

  return {
    ...recordingState,
    startRecording,
    stopRecording,
    downloadRecording,
    setRecordingState
  };
}
