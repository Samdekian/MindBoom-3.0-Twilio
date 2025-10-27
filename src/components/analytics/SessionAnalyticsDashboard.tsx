/**
 * Real-time Session Analytics Dashboard
 * Displays comprehensive session metrics and insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Wifi, 
  Volume2, 
  Video, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SessionMetrics {
  connectionQuality: number;
  bitrate: number;
  frameRate: number;
  packetLoss: number;
  latency: number;
  jitter: number;
  audioLevel: number;
  videoResolution: string;
  timestamp: number;
}

interface ParticipantMetrics {
  id: string;
  name: string;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  audioEnabled: boolean;
  videoEnabled: boolean;
  speakingTime: number;
  silenceTime: number;
  networkStability: number;
  deviceInfo: {
    camera: string;
    microphone: string;
    browser: string;
  };
}

interface AnalyticsSummary {
  sessionDuration: number;
  totalParticipants: number;
  averageConnectionQuality: number;
  totalSpeakingTime: number;
  networkIssues: number;
  qualityDrops: number;
  reconnections: number;
}

interface SessionAnalyticsDashboardProps {
  sessionId: string;
  isActive: boolean;
  participants: ParticipantMetrics[];
  realTimeMetrics: SessionMetrics[];
  summary: AnalyticsSummary;
  onExportData?: () => void;
}

export const SessionAnalyticsDashboard: React.FC<SessionAnalyticsDashboardProps> = ({
  sessionId,
  isActive,
  participants,
  realTimeMetrics,
  summary,
  onExportData
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'quality' | 'bitrate' | 'latency'>('quality');
  const [alertsCount, setAlertsCount] = useState(0);

  // Mock real-time data updates
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // In a real implementation, this would fetch latest metrics
      console.log('📊 Updating analytics dashboard...');
      
      // Check for quality issues
      const currentMetrics = realTimeMetrics[realTimeMetrics.length - 1];
      if (currentMetrics?.connectionQuality < 70) {
        setAlertsCount(prev => prev + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, realTimeMetrics]);

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const chartData = realTimeMetrics.slice(-20).map((metric, index) => ({
    time: index,
    quality: metric.connectionQuality,
    bitrate: metric.bitrate / 1000, // Convert to Kbps
    latency: metric.latency,
    packetLoss: metric.packetLoss * 100
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Analytics</h2>
          <p className="text-muted-foreground">Real-time monitoring for session {sessionId}</p>
        </div>
        <div className="flex items-center gap-4">
          {isActive && (
            <Badge variant="default" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Session
            </Badge>
          )}
          {alertsCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {alertsCount} Alerts
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(summary.sessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              {isActive ? 'Active session' : 'Session ended'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">
              {participants.filter(p => p.audioEnabled || p.videoEnabled).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getQualityColor(summary.averageConnectionQuality)}`}>
              {Math.round(summary.averageConnectionQuality)}%
            </div>
            <Progress value={summary.averageConnectionQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.networkIssues}</div>
            <p className="text-xs text-muted-foreground">
              {summary.reconnections} reconnections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          <TabsTrigger value="summary">Session Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Real-time Performance
              </CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric('quality')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedMetric === 'quality' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  Connection Quality
                </button>
                <button
                  onClick={() => setSelectedMetric('bitrate')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedMetric === 'bitrate' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  Bitrate
                </button>
                <button
                  onClick={() => setSelectedMetric('latency')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedMetric === 'latency' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  Latency
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <div className="grid gap-4">
            {participants.map((participant) => (
              <Card key={participant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{participant.name}</CardTitle>
                    <Badge variant={getQualityBadgeVariant(participant.connectionQuality)}>
                      {participant.connectionQuality}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      {participant.audioEnabled ? (
                        <Volume2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">Audio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.videoEnabled ? (
                        <Video className="w-4 h-4 text-green-600" />
                      ) : (
                        <Video className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">Video</span>
                    </div>
                    <div className="text-sm">
                      <div>Speaking: {formatDuration(participant.speakingTime)}</div>
                    </div>
                    <div className="text-sm">
                      <div>Stability: {Math.round(participant.networkStability * 100)}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Device Info</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Camera: {participant.deviceInfo.camera || 'Unknown'}</div>
                      <div>Microphone: {participant.deviceInfo.microphone || 'Unknown'}</div>
                      <div>Browser: {participant.deviceInfo.browser || 'Unknown'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connection Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['excellent', 'good', 'fair', 'poor'].map((quality) => {
                    const count = participants.filter(p => p.connectionQuality === quality).length;
                    const percentage = participants.length > 0 ? (count / participants.length) * 100 : 0;
                    
                    return (
                      <div key={quality} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{quality}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quality Drops</span>
                    <Badge variant="outline">{summary.qualityDrops}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reconnections</span>
                    <Badge variant="outline">{summary.reconnections}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network Issues</span>
                    <Badge variant="outline">{summary.networkIssues}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-2xl font-bold">{formatDuration(summary.sessionDuration)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total Speaking Time</div>
                  <div className="text-2xl font-bold">{formatDuration(summary.totalSpeakingTime)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Average Quality</div>
                  <div className="text-2xl font-bold">{Math.round(summary.averageConnectionQuality)}%</div>
                </div>
              </div>

              {onExportData && (
                <div className="pt-4 border-t">
                  <button
                    onClick={onExportData}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                  >
                    Export Analytics Data
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};