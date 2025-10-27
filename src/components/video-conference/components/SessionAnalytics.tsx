import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  Wifi, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionAnalyticsProps {
  sessionId: string;
  participants: any[];
  connectionState: string;
  networkQuality: any;
  sessionDuration: number;
  className?: string;
}

interface AnalyticsData {
  totalParticipants: number;
  averageConnectionQuality: string;
  disconnectionCount: number;
  reconnectionCount: number;
  peakConcurrentUsers: number;
  sessionStability: number;
  bandwidthUsage: string;
}

const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({
  sessionId,
  participants,
  connectionState,
  networkQuality,
  sessionDuration,
  className
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalParticipants: 0,
    averageConnectionQuality: 'good',
    disconnectionCount: 0,
    reconnectionCount: 0,
    peakConcurrentUsers: 0,
    sessionStability: 95,
    bandwidthUsage: 'moderate'
  });

  const [isRecording, setIsRecording] = useState(false);

  // Calculate real-time analytics
  useEffect(() => {
    const activeParticipants = participants.filter(p => p.connectionQuality !== 'disconnected');
    const qualityScores = participants.map(p => {
      switch (p.connectionQuality) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'poor': return 2;
        case 'disconnected': return 1;
        default: return 3;
      }
    });

    const averageScore = qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
      : 3;

    const averageQuality = averageScore >= 3.5 ? 'excellent' :
                          averageScore >= 2.5 ? 'good' : 'poor';

    setAnalytics(prev => ({
      ...prev,
      totalParticipants: Math.max(prev.totalParticipants, participants.length),
      peakConcurrentUsers: Math.max(prev.peakConcurrentUsers, activeParticipants.length),
      averageConnectionQuality: averageQuality
    }));
  }, [participants]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500 bg-green-500/10';
      case 'good': return 'text-blue-500 bg-blue-500/10';
      case 'poor': return 'text-yellow-500 bg-yellow-500/10';
      case 'disconnected': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const exportAnalytics = () => {
    const data = {
      sessionId,
      timestamp: new Date().toISOString(),
      duration: sessionDuration,
      analytics,
      participants: participants.map(p => ({
        id: p.id,
        name: p.name,
        connectionQuality: p.connectionQuality,
        videoEnabled: p.videoEnabled,
        audioEnabled: p.audioEnabled
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-analytics-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Session Analytics</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalytics}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Session Duration */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(sessionDuration)}</div>
            <p className="text-xs text-muted-foreground">Session time</p>
          </CardContent>
        </Card>

        {/* Active Participants */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {participants.filter(p => p.connectionQuality !== 'disconnected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Peak: {analytics.peakConcurrentUsers}
            </p>
          </CardContent>
        </Card>

        {/* Connection Quality */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getQualityColor(analytics.averageConnectionQuality)}>
              {analytics.averageConnectionQuality}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Average quality</p>
          </CardContent>
        </Card>

        {/* Session Stability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Stability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sessionStability}%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Participant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{participant.name}</span>
                  {participant.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={getQualityColor(participant.connectionQuality)}
                  >
                    {participant.connectionQuality}
                  </Badge>
                  <div className="flex gap-1">
                    {participant.videoEnabled ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    )}
                    {participant.audioEnabled ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Bandwidth Usage</p>
              <p className="text-lg font-semibold capitalize">{analytics.bandwidthUsage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection State</p>
              <Badge className={connectionState === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}>
                {connectionState}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disconnections</p>
              <p className="text-lg font-semibold">{analytics.disconnectionCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reconnections</p>
              <p className="text-lg font-semibold">{analytics.reconnectionCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionAnalytics;