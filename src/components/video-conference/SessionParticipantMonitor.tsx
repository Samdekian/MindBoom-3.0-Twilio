
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useSessionParticipants } from '@/hooks/use-session-participants';
import { formatDistanceToNow } from 'date-fns';

interface SessionParticipantMonitorProps {
  sessionId: string;
  isTherapist?: boolean;
}

const SessionParticipantMonitor: React.FC<SessionParticipantMonitorProps> = ({
  sessionId,
  isTherapist = false,
}) => {
  // Only run the hook if we have a valid sessionId
  const shouldFetch = sessionId && sessionId.trim() !== '' && sessionId !== 'mock-appointment-id';
  
  const { participants, loading, admitParticipant, removeParticipant } = useSessionParticipants(
    shouldFetch ? sessionId : null
  );

  // Don't render anything if sessionId is invalid or empty
  if (!shouldFetch) {
    return null;
  }

  const waitingParticipants = participants.filter(p => p.role === 'participant' && p.is_active);

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Loading participants...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (waitingParticipants.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5 text-blue-600" />
            Session Participants
          </CardTitle>
          <CardDescription className="text-slate-600">
            No participants waiting to join
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Users className="h-5 w-5 text-blue-600" />
          Session Participants
          <Badge variant="secondary" className="ml-2">{waitingParticipants.length}</Badge>
        </CardTitle>
        <CardDescription className="text-slate-600">
          {isTherapist ? 'Manage participants waiting to join your session' : 'Participants in this session'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {waitingParticipants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <div className="font-medium text-slate-900">
                  {participant.participant_name || 'Anonymous User'}
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Joined {formatDistanceToNow(new Date(participant.joined_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            
            {isTherapist && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => admitParticipant(participant.id)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="h-3 w-3" />
                  Admit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeParticipant(participant.id)}
                  className="flex items-center gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <UserX className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default React.memo(SessionParticipantMonitor);
