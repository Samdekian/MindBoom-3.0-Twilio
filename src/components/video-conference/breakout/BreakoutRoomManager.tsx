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
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Breakout Rooms</h3>
            {hasActiveRooms && (
              <p className="text-xs text-gray-500">
                {state.activeRoomCount} active • {state.totalParticipants} participants
              </p>
            )}
            {!hasActiveRooms && (
              <p className="text-xs text-gray-500">Split group into focused discussions</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveRooms && (
            <Button
              variant="destructive"
              size="sm"
              onClick={closeAllRooms}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Close All
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              refreshRooms();
              refreshAssignments();
            }}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {!hasActiveRooms ? (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full h-9 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm shadow-md"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Breakout Rooms
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Compact Room List */}
            <div className="grid grid-cols-2 gap-2">
              {rooms.slice(0, 4).map((room) => (
                <div
                  key={room.id}
                  className="relative p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {room.room_name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {room.current_participants}/{room.max_participants}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => closeRoom(room.id)}
                      className="h-6 w-6 -mt-1 -mr-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {room.current_participants >= room.max_participants && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-b-lg"></div>
                  )}
                </div>
              ))}
            </div>

            {rooms.length > 4 && (
              <p className="text-xs text-center text-gray-500">
                +{rooms.length - 4} more rooms
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignments(!showAssignments)}
                className="flex-1 h-8 text-xs"
              >
                <Users className="h-3 w-3 mr-1" />
                {showAssignments ? 'Hide' : 'Manage'} Assignments
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Expanded Assignments */}
            {showAssignments && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
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
        )}

        {/* Create Room Dialog */}
        <RoomCreationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateRooms={createRooms}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
};

export default BreakoutRoomManager;

