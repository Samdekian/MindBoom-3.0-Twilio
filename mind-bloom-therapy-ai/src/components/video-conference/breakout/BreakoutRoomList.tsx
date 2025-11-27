/**
 * Breakout Room List
 * Displays list of active breakout rooms with controls
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, X, ExternalLink } from 'lucide-react';
import type { BreakoutRoomWithParticipants } from '@/types/breakout-room';

interface BreakoutRoomListProps {
  rooms: BreakoutRoomWithParticipants[];
  onCloseRoom: (roomId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

const BreakoutRoomList: React.FC<BreakoutRoomListProps> = ({
  rooms,
  onCloseRoom,
  onRefresh,
  isLoading = false
}) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No active breakout rooms</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Active Rooms</h4>
        <Badge variant="secondary">{rooms.length}</Badge>
      </div>

      <div className="space-y-2">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium truncate">{room.room_name}</h5>
                    {room.is_active && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {room.current_participants} / {room.max_participants}
                      </span>
                    </div>

                    {room.twilio_room_sid && (
                      <div className="flex items-center gap-1 text-xs">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {room.twilio_room_sid.substring(0, 12)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Participants list */}
                  {room.participants && room.participants.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Participants:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.participants
                          .filter(p => p.is_active)
                          .map((participant) => (
                            <Badge
                              key={participant.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {participant.participant_name || 'Anonymous'}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCloseRoom(room.id)}
                  disabled={isLoading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Room capacity warning */}
              {room.current_participants >= room.max_participants && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  Room is full
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BreakoutRoomList;

