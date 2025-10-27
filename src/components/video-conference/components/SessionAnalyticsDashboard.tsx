import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  Wifi, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface SessionAnalytics {
  sessionId: string;
  totalParticipants: number;
  maxConcurrentParticipants: number;
  totalDurationSeconds: number;
  connectionQualityAvg: number;
  disconnectionCount: number;
  reconnectionCount: number;
  chatMessagesCount: number;
  recordingDurationSeconds: number;
}

interface AnalyticsSummary {
  participantEngagement: string;
  averageSessionLength: string;
  connectionStability: string;
  interactionLevel: string;
}

interface SessionAnalyticsDashboardProps {
  analytics: SessionAnalytics | null;
  summary: AnalyticsSummary | null;
  isTracking: boolean;
  className?: string;
}

const SessionAnalyticsDashboard: React.FC<SessionAnalyticsDashboardProps> = ({
  analytics,
  summary,
  isTracking,
  className
}) => {
  if (!analytics || !summary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Session Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Analytics data will appear here once the session begins</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'Excellent': return 'bg-emerald-500/20 text-emerald-700';
      case 'Good': return 'bg-blue-500/20 text-blue-700';
      case 'Poor': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getInteractionColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-purple-500/20 text-purple-700';
      case 'Medium': return 'bg-amber-500/20 text-amber-700';
      case 'Low': return 'bg-gray-500/20 text-gray-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Session Analytics
          {isTracking && (
            <Badge variant="secondary" className="ml-auto">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse" />
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-blue-600" />
              Participants
            </div>
            <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
            <div className="text-xs text-muted-foreground">
              Max concurrent: {analytics.maxConcurrentParticipants}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-emerald-600" />
              Duration
            </div>
            <div className="text-2xl font-bold">
              {formatDuration(analytics.totalDurationSeconds)}
            </div>
            <div className="text-xs text-muted-foreground">
              {summary.averageSessionLength}
            </div>
          </div>
        </div>

        {/* Connection Quality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wifi className="h-4 w-4 text-indigo-600" />
            Connection Quality
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Quality</span>
              <span>{(analytics.connectionQualityAvg * 100).toFixed(0)}%</span>
            </div>
            <Progress value={analytics.connectionQualityAvg * 100} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stability</span>
            <Badge className={getStabilityColor(summary.connectionStability)}>
              {summary.connectionStability}
            </Badge>
          </div>
        </div>

        {/* Interaction Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            Interaction
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Chat Messages</span>
            <span className="font-semibold">{analytics.chatMessagesCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Activity Level</span>
            <Badge className={getInteractionColor(summary.interactionLevel)}>
              {summary.interactionLevel}
            </Badge>
          </div>
        </div>

        {/* Issues & Recovery */}
        {(analytics.disconnectionCount > 0 || analytics.reconnectionCount > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Connection Issues
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Disconnections</span>
                <span className="font-semibold text-red-600">
                  {analytics.disconnectionCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reconnections</span>
                <span className="font-semibold text-emerald-600">
                  {analytics.reconnectionCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Score */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Engagement
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Participant Engagement</span>
            <span className="font-semibold">{summary.participantEngagement}</span>
          </div>
        </div>

        {/* Session Health Indicator */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              analytics.disconnectionCount === 0 ? 'bg-emerald-500' :
              analytics.disconnectionCount <= 2 ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              Session Health: {summary.connectionStability}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionAnalyticsDashboard;