
import { useCallback } from "react";
import { RecordingState } from "../video-conference/types";

export const useRecordingControls = (
  recorder: MediaRecorder | null,
  toast: any
) => {
  const pauseRecording = useCallback(() => {
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      toast({
        title: "Recording Paused",
        description: "You can resume recording at any time",
      });
      return true;
    }
    return false;
  }, [recorder, toast]);
  
  const resumeRecording = useCallback(() => {
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      toast({
        title: "Recording Resumed",
        description: "Recording is now continuing",
      });
      return true;
    }
    return false;
  }, [recorder, toast]);

  return {
    pauseRecording,
    resumeRecording
  };
};
