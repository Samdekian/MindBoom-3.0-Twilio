/**
 * Breakout Room Manager Component
 * Main control panel for therapists to manage breakout rooms
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useBreakoutRooms } from '@/hooks/video-conference/use-breakout-rooms';
import RoomCreationDialog from './RoomCreationDialog';
import BreakoutRoomList from './BreakoutRoomList';
import ParticipantAssignment from './ParticipantAssignment';

interface BreakoutRoomManagerProps {
  sessionId: string;
  isTherapist: boolean;
}

export const BreakoutRoomManager: React.FC<BreakoutRoomManagerProps> = ({
  sessionId,
  isTherapist
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);

  const {
    state,
    rooms,
    assignments,
    createRooms,
    closeRoom,
    closeAllRooms,
    moveParticipant,
    refreshRooms,
    refreshAssignments
  } = useBreakoutRooms({ sessionId, enabled: isTherapist });

  if (!isTherapist) {
    return null;
  }

  const hasActiveRooms = state.activeRoomCount > 0;
  const isLoading = state.status === 'creating' || state.status === 'closing';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Breakout Rooms
            </CardTitle>
            <CardDescription>
              Manage breakout rooms for group discussions
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveRooms && (
              <Badge variant="default" className="px-3">
                {state.activeRoomCount} Active {state.activeRoomCount === 1 ? 'Room' : 'Rooms'}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                refreshRooms();
                refreshAssignments();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Status Info */}
        {hasActiveRooms && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">
                {state.totalParticipants} {state.totalParticipants === 1 ? 'participant' : 'participants'} in breakout rooms
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {state.config?.assignmentStrategy === 'auto' ? 'Automatically assigned' : 'Manually assigned'}
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={closeAllRooms}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Close All Rooms
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {!hasActiveRooms ? (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Breakout Rooms
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Split participants into separate rooms for group discussions
            </p>
          </div>
        ) : (
          <>
            {/* Room List */}
            <BreakoutRoomList
              rooms={rooms}
              onCloseRoom={closeRoom}
              onRefresh={refreshRooms}
              isLoading={isLoading}
            />

            {/* Participant Assignments */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignments(!showAssignments)}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                {showAssignments ? 'Hide' : 'Show'} Participant Assignments
              </Button>

              {showAssignments && (
                <div className="mt-4">
                  <ParticipantAssignment
                    sessionId={sessionId}
                    rooms={rooms}
                    assignments={assignments}
                    onMoveParticipant={moveParticipant}
                    onRefresh={refreshAssignments}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Room Dialog */}
        <RoomCreationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateRooms={createRooms}
          sessionId={sessionId}
        />
      </CardContent>
    </Card>
  );
};

export default BreakoutRoomManager;

