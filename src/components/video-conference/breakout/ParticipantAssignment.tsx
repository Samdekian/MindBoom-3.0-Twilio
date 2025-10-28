/**
 * Participant Assignment Component
 * Shows and allows modification of participant assignments to breakout rooms
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, ArrowRight, RefreshCw } from 'lucide-react';
import type {
  BreakoutRoomWithParticipants,
  ParticipantAssignment as ParticipantAssignmentType,
  MoveParticipantRequest
} from '@/types/breakout-room';

interface ParticipantAssignmentProps {
  sessionId: string;
  rooms: BreakoutRoomWithParticipants[];
  assignments: ParticipantAssignmentType[];
  onMoveParticipant: (request: MoveParticipantRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const ParticipantAssignment: React.FC<ParticipantAssignmentProps> = ({
  sessionId,
  rooms,
  assignments,
  onMoveParticipant,
  onRefresh
}) => {
  const [movingParticipant, setMovingParticipant] = useState<string | null>(null);

  const handleMoveParticipant = async (
    participantId: string,
    fromRoomId: string | null,
    toRoomId: string
  ) => {
    if (!toRoomId || toRoomId === fromRoomId) return;

    try {
      setMovingParticipant(participantId);

      const request: MoveParticipantRequest = {
        participant_id: participantId,
        from_room_id: fromRoomId,
        to_room_id: toRoomId,
        transition_type: 'manual',
        reason: 'Moved by therapist'
      };

      await onMoveParticipant(request);

    } catch (error) {
      console.error('Failed to move participant:', error);
    } finally {
      setMovingParticipant(null);
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No participant assignments yet</p>
      </div>
    );
  }

  // Group assignments by room
  const unassigned = assignments.filter(a => !a.breakout_room_id);
  const assigned = assignments.filter(a => a.breakout_room_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Participant Assignments</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Assigned Participants */}
      {assigned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Assigned ({assigned.length})
          </p>
          {assigned.map((assignment) => (
            <Card key={assignment.participant_id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {assignment.participant_name || 'Anonymous'}
                    </p>
                    {assignment.breakout_room_name && (
                      <p className="text-xs text-muted-foreground">
                        Currently in: {assignment.breakout_room_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={assignment.breakout_room_id || ''}
                      onValueChange={(newRoomId) =>
                        handleMoveParticipant(
                          assignment.participant_id,
                          assignment.breakout_room_id,
                          newRoomId
                        )
                      }
                      disabled={movingParticipant === assignment.participant_id}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.room_name}
                            {room.current_participants >= room.max_participants && 
                             room.id !== assignment.breakout_room_id && ' (Full)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {movingParticipant === assignment.participant_id && (
                      <ArrowRight className="h-4 w-4 animate-pulse text-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Unassigned Participants */}
      {unassigned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Unassigned ({unassigned.length})
          </p>
          {unassigned.map((assignment) => (
            <Card key={assignment.participant_id} className="border-dashed">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {assignment.participant_name || 'Anonymous'}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Not in room
                    </Badge>
                  </div>

                  <Select
                    value=""
                    onValueChange={(roomId) =>
                      handleMoveParticipant(
                        assignment.participant_id,
                        null,
                        roomId
                      )
                    }
                    disabled={movingParticipant === assignment.participant_id}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Assign to room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem
                          key={room.id}
                          value={room.id}
                          disabled={room.current_participants >= room.max_participants}
                        >
                          {room.room_name}
                          {room.current_participants >= room.max_participants && ' (Full)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantAssignment;

