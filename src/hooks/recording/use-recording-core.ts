
import { useState, useCallback, useRef } from 'react';
import { RecordingState } from './index';

export function useRecordingCore() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    startTime: Date.now(),
    duration: 0,
    savedRecordings: [],
    error: null,
    recorder: null,
    recordingStream: null
  });
  
  const recordingInterval = useRef<number | null>(null);
  
  const startRecording = useCallback(async (stream: MediaStream): Promise<boolean> => {
    try {
      if (!stream) {
        throw new Error("No media stream provided");
      }
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });
      
      recorder.addEventListener('stop', () => {
        const now = Date.now();
        const startTime = recordingState.startTime;
        const duration = now - startTime;
        
        const recordingBlob = new Blob(chunks, { type: 'video/webm' });
        
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          duration,
          savedRecordings: [...prev.savedRecordings, recordingBlob]
        }));
        
        // Clear interval if it exists
        if (recordingInterval.current) {
          window.clearInterval(recordingInterval.current);
          recordingInterval.current = null;
        }
      });
      
      // Start recording
      recorder.start();
      
      // Set up duration tracker
      const intervalId = window.setInterval(() => {
        const now = Date.now();
        const startTime = recordingState.startTime;
        setRecordingState(prev => ({
          ...prev,
          duration: now - startTime
        }));
      }, 1000);
      
      recordingInterval.current = intervalId;
      
      // Update state
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        startTime: Date.now(),
        duration: 0,
        error: null,
        recorder,
        recordingStream: stream
      }));
      
      return true;
    } catch (error) {
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        error: error instanceof Error ? error : new Error('Unknown recording error')
      }));
      return false;
    }
  }, [recordingState.startTime]);
  
  const stopRecording = useCallback(async (): Promise<boolean> => {
    try {
      if (!recordingState.isRecording || !recordingState.recorder) {
        return false;
      }
      
      // Stop the recorder
      recordingState.recorder.stop();
      
      // Stop all tracks in the recording stream
      if (recordingState.recordingStream) {
        recordingState.recordingStream.getTracks().forEach(track => track.stop());
      }
      
      return true;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return false;
    }
  }, [recordingState.isRecording, recordingState.recorder, recordingState.recordingStream]);
  
  return {
    recordingState,
    startRecording,
    stopRecording,
    isRecording: recordingState.isRecording
  };
}
