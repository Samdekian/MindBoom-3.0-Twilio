/**
 * Breakout Room Controls
 * Quick action buttons for managing breakout rooms
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Users, X, RefreshCw } from 'lucide-react';

interface BreakoutRoomControlsProps {
  hasActiveRooms: boolean;
  activeRoomCount: number;
  totalParticipants: number;
  isLoading?: boolean;
  onCreateRooms: () => void;
  onCloseAllRooms: () => void;
  onRefresh: () => void;
}

export const BreakoutRoomControls: React.FC<BreakoutRoomControlsProps> = ({
  hasActiveRooms,
  activeRoomCount,
  totalParticipants,
  isLoading = false,
  onCreateRooms,
  onCloseAllRooms,
  onRefresh
}) => {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {/* Room Status Badge */}
        {hasActiveRooms && (
          <Badge variant="default" className="gap-1">
            <Users className="h-3 w-3" />
            {activeRoomCount} {activeRoomCount === 1 ? 'Room' : 'Rooms'}
            {totalParticipants > 0 && ` • ${totalParticipants}`}
          </Badge>
        )}

        {/* Create Rooms Button */}
        {!hasActiveRooms && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateRooms}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Breakout Rooms
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create breakout rooms for group discussions</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Close All Rooms Button */}
        {hasActiveRooms && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={onCloseAllRooms}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Close All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close all breakout rooms</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Refresh Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh breakout rooms</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default BreakoutRoomControls;

