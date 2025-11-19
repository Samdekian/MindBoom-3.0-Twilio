/**
 * Room Creation Dialog
 * Dialog for configuring and creating breakout rooms
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shuffle, Hand } from 'lucide-react';
import type { BreakoutRoomConfig } from '@/types/breakout-room';
import { TwilioVideoService } from '@/services/twilio-video-service';

interface RoomCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRooms: (config: BreakoutRoomConfig) => Promise<void>;
  sessionId: string;
}

const RoomCreationDialog: React.FC<RoomCreationDialogProps> = ({
  open,
  onOpenChange,
  onCreateRooms,
  sessionId
}) => {
  const [roomCount, setRoomCount] = useState(2);
  const [maxParticipantsPerRoom, setMaxParticipantsPerRoom] = useState(5);
  const [assignmentStrategy, setAssignmentStrategy] = useState<'auto' | 'manual'>('auto');
  const [participantCount, setParticipantCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch participant count
  useEffect(() => {
    if (open) {
      fetchParticipantCount();
    }
  }, [open]);

  const fetchParticipantCount = async () => {
    try {
      const participants = await TwilioVideoService.getSessionParticipants(sessionId);
      setParticipantCount(participants.length);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  const handleCreate = async () => {
    setError(null);

    // Validation
    if (roomCount < 1 || roomCount > 10) {
      setError('Number of rooms must be between 1 and 10');
      return;
    }

    if (maxParticipantsPerRoom < 2 || maxParticipantsPerRoom > 15) {
      setError('Participants per room must be between 2 and 15');
      return;
    }

    if (participantCount < 2) {
      setError('Need at least 2 participants to create breakout rooms');
      return;
    }

    try {
      setIsCreating(true);

      const config: BreakoutRoomConfig = {
        roomCount,
        maxParticipantsPerRoom,
        assignmentStrategy,
        allowSelfSwitch: false
      };

      await onCreateRooms(config);
      
      // Wait a bit for UI to update before closing dialog
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onOpenChange(false);

      // Reset form
      setRoomCount(2);
      setMaxParticipantsPerRoom(5);
      setAssignmentStrategy('auto');

    } catch (err: any) {
      setError(err.message || 'Failed to create rooms');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Breakout Rooms</DialogTitle>
          <DialogDescription>
            Configure breakout rooms for group discussions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Participant Count */}
          <div className="text-sm text-muted-foreground">
            {participantCount} {participantCount === 1 ? 'participant' : 'participants'} in session
          </div>
          {participantCount < 2 && (
            <Alert variant="default" className="border-amber-200 bg-amber-50 text-amber-700">
              <AlertDescription>
                Invite at least one more participant before creating breakout rooms.
              </AlertDescription>
            </Alert>
          )}

          {/* Number of Rooms */}
          <div className="space-y-2">
            <Label htmlFor="roomCount">Number of Rooms</Label>
            <Input
              id="roomCount"
              type="number"
              min="1"
              max="10"
              value={roomCount}
              onChange={(e) => setRoomCount(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 10 rooms
            </p>
          </div>

          {/* Max Participants Per Room */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants Per Room</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="2"
              max="15"
              value={maxParticipantsPerRoom}
              onChange={(e) => setMaxParticipantsPerRoom(parseInt(e.target.value) || 2)}
            />
            <p className="text-xs text-muted-foreground">
              2-15 participants per room
            </p>
          </div>

          {/* Assignment Strategy */}
          <div className="space-y-3">
            <Label>Assignment Strategy</Label>
            <RadioGroup
              value={assignmentStrategy}
              onValueChange={(value) => setAssignmentStrategy(value as 'auto' | 'manual')}
            >
              <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="auto" id="auto" />
                <div className="flex-1">
                  <label
                    htmlFor="auto"
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <Shuffle className="h-4 w-4" />
                    Automatic (Random)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Participants will be randomly distributed across rooms
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="manual" id="manual" />
                <div className="flex-1">
                  <label
                    htmlFor="manual"
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <Hand className="h-4 w-4" />
                    Manual
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    You will assign participants to rooms manually
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">Preview:</p>
            <p className="text-muted-foreground">
              Creating {roomCount} {roomCount === 1 ? 'room' : 'rooms'} with up to{' '}
              {maxParticipantsPerRoom} participants each
            </p>
            {assignmentStrategy === 'auto' && (
              <p className="text-muted-foreground">
                Participants will be assigned randomly
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || participantCount < 2}
          >
            {isCreating ? 'Creating...' : 'Create Rooms'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomCreationDialog;

