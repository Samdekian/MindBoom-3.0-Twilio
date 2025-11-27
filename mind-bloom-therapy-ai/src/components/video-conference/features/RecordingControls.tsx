import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Circle, StopCircle, Download, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useVideoSession } from '@/contexts/TwilioVideoSessionContext';
import { supabase } from '@/integrations/supabase/client';

interface RecordingControlsProps {
  sessionId: string;
  className?: string;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  sessionId,
  className,
  onRecordingStart,
  onRecordingStop
}) => {
  const { videoState, participants } = useVideoSession();
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingData, setRecordingData] = useState<any>(null);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (videoState.isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoState.isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = useCallback(async () => {
    try {
      setIsStarting(true);
      
      if (!sessionId) {
        throw new Error('Session ID is required for recording');
      }

      if (participants.length === 0) {
        throw new Error('No participants in session');
      }

      const currentUser = participants.find(p => p.isCurrentUser);
      if (!currentUser) {
        throw new Error('Current user not found in participants');
      }

      // Start recording via edge function
      const { data, error } = await supabase.functions.invoke('agora-recording', {
        body: {
          action: 'start_recording',
          sessionId,
          channelName: sessionId,
          uid: parseInt(currentUser.id) || 12345,
          token: '', // Will be generated in the edge function if needed
          recordingConfig: {
            maxIdleTime: 30,
            subscribeVideoUids: ['#allstream#'],
            subscribeAudioUids: ['#allstream#'],
            subscribeUidGroup: 0
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to start recording');
      }

      setRecordingData({
        resourceId: data.resourceId,
        sid: data.sid
      });

      onRecordingStart?.();
      toast.success('Recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      let errorMessage = 'Failed to start recording';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsStarting(false);
    }
  }, [sessionId, participants, onRecordingStart]);

  const handleStopRecording = useCallback(async () => {
    try {
      setIsStopping(true);
      
      if (!recordingData) {
        throw new Error('No active recording found');
      }

      // Stop recording via edge function
      const { data, error } = await supabase.functions.invoke('agora-recording', {
        body: {
          action: 'stop_recording',
          sessionId,
          resourceId: recordingData.resourceId,
          sid: recordingData.sid
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to stop recording');
      }

      setRecordingData(null);
      onRecordingStop?.();
      
      toast.success(
        <div>
          <p>Recording stopped successfully</p>
          {data.fileList && data.fileList.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Files will be available for download shortly
            </p>
          )}
        </div>
      );
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      
      let errorMessage = 'Failed to stop recording';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsStopping(false);
    }
  }, [sessionId, recordingData, onRecordingStop]);

  const handleDownloadRecordings = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agora-recording', {
        body: {
          action: 'get_recording_status',
          sessionId
        }
      });

      if (error) {
        throw error;
      }

      const completedRecordings = data.recordings?.filter((r: any) => 
        r.status === 'completed' && r.file_list?.length > 0
      ) || [];

      if (completedRecordings.length === 0) {
        toast.info('No completed recordings available for download');
        return;
      }

      // For now, just show available recordings
      toast.success(`${completedRecordings.length} recording(s) available. Check your cloud storage for files.`);
      
    } catch (error) {
      console.error('Failed to get recordings:', error);
      toast.error('Failed to retrieve recordings');
    }
  }, [sessionId]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {videoState.isRecording ? (
        <>
          <Badge variant="default" className="bg-red-500/20 text-red-300 border-red-500/50 animate-pulse">
            <Circle className="h-3 w-3 mr-1 fill-current" />
            REC {formatDuration(recordingDuration)}
          </Badge>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStopRecording}
            disabled={isStopping}
            className="hover:bg-red-600"
          >
            {isStopping ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <StopCircle className="h-4 w-4 mr-1" />
            )}
            Stop Recording
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartRecording}
          disabled={isStarting}
          className="hover:bg-red-600 hover:text-white"
        >
          {isStarting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Circle className="h-4 w-4 mr-1" />
          )}
          Start Recording
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownloadRecordings}
        className="text-gray-400 hover:text-white"
        title="Download previous recordings"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};