
import { useState } from 'react';
import { RecordingState } from "../video-conference/types";

export function useRecordingSession() {
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
  
  const [recordings, setRecordings] = useState<string[]>([]);

  // Function to add a recording to the list
  const addRecording = (url: string) => {
    setRecordings(prev => [...prev, url]);
  };

  // Function to clear recordings
  const clearRecordings = () => {
    setRecordings([]);
  };

  return {
    recordingState,
    setRecordingState,
    recordings,
    addRecording,
    clearRecordings
  };
}
