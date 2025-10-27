import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  Server, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  RotateCcw,
  Signal
} from 'lucide-react';
import { ConnectionQualityIndicator } from './ConnectionQualityIndicator';
import { iceServerManager } from '@/lib/webrtc/ice-server-config';
import { sessionPersistence } from '@/lib/webrtc/session-persistence';
import { ConnectionQuality } from '@/lib/webrtc/connection-monitor';

interface WebRTCDashboardProps {
  sessionId: string;
  userId: string;
  connectionQualities?: Record<string, ConnectionQuality>;
  participantCount?: number;
  onForceReconnect?: () => void;
}

interface ServerHealth {
  totalServers: number;
  stunServers: number;
  turnServers: number;
  workingServers: number;
  hasTurnCredentials: boolean;
}

interface SessionStats {
  sessionId: string;
  userId: string;
  participants: string[];
  status: string;
  startTime: string;
  lastActivity: string;
  quality?: any;
}

export const WebRTCDashboard: React.FC<WebRTCDashboardProps> = ({
  sessionId,
  userId,
  connectionQualities = {},
  participantCount = 0,
  onForceReconnect
}) => {
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [isTestingServers, setIsTestingServers] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Refresh data periodically
  useEffect(() => {
    const refreshData = () => {
      loadServerHealth();
      loadSessionStats();
      setLastUpdate(new Date());
    };

    refreshData();
    const interval = setInterval(refreshData, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [sessionId, userId]);

  const loadServerHealth = async () => {
    try {
      const health = await iceServerManager.getServerHealth();
      setServerHealth(health);
    } catch (error) {
      console.error('Failed to load server health:', error);
    }
  };

  const loadSessionStats = () => {
    const stats = sessionPersistence.getCurrentSession();
    setSessionStats(stats);
  };

  const testServers = async () => {
    setIsTestingServers(true);
    try {
      await iceServerManager.testICEServers();
      await loadServerHealth();
    } catch (error) {
      console.error('Failed to test servers:', error);
    } finally {
      setIsTestingServers(false);
    }
  };

  const getOverallQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected' => {
    const qualities = Object.values(connectionQualities);
    if (qualities.length === 0) return 'disconnected';

    const scores = qualities.map(q => {
      switch (q.overall) {
        case 'excellent': return 5;
        case 'good': return 4;
        case 'fair': return 3;
        case 'poor': return 2;
        case 'disconnected': return 1;
        default: return 1;
      }
    });

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore >= 4.5) return 'excellent';
    if (avgScore >= 3.5) return 'good';
    if (avgScore >= 2.5) return 'fair';
    if (avgScore >= 1.5) return 'poor';
    return 'disconnected';
  };

  const getHealthScore = (): number => {
    if (!serverHealth) return 0;
    
    let score = 0;
    
    // Server availability (40% weight)
    if (serverHealth.totalServers > 0) {
      score += (serverHealth.workingServers / serverHealth.totalServers) * 40;
    }
    
    // TURN availability (30% weight)
    if (serverHealth.hasTurnCredentials && serverHealth.turnServers > 0) {
      score += 30;
    }
    
    // STUN availability (20% weight)
    if (serverHealth.stunServers > 0) {
      score += 20;
    }
    
    // Connection quality (10% weight)
    const overallQuality = getOverallQuality();
    const qualityScore = overallQuality === 'excellent' ? 10 :
                        overallQuality === 'good' ? 8 :
                        overallQuality === 'fair' ? 6 :
                        overallQuality === 'poor' ? 4 : 0;
    score += qualityScore;
    
    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">WebRTC Infrastructure Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Session: {sessionId} • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getHealthScore() > 80 ? 'default' : getHealthScore() > 60 ? 'secondary' : 'destructive'}>
            Health: {getHealthScore()}%
          </Badge>
          
          {onForceReconnect && (
            <Button variant="outline" size="sm" onClick={onForceReconnect}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reconnect
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="session">Session</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{participantCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ICE Servers</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serverHealth?.workingServers ?? 0}/{serverHealth?.totalServers ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Working/Total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connection Quality</CardTitle>
                <Signal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{getOverallQuality()}</div>
                <p className="text-xs text-muted-foreground">
                  Average across peers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Infrastructure</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getHealthScore()}%</div>
                <Progress value={getHealthScore()} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Servers Tab */}
        <TabsContent value="servers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                ICE Server Status
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testServers}
                  disabled={isTestingServers}
                >
                  {isTestingServers ? 'Testing...' : 'Test Servers'}
                </Button>
              </CardTitle>
              <CardDescription>
                STUN and TURN server connectivity and health status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serverHealth ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">STUN Servers</span>
                      <Badge variant="secondary">{serverHealth.stunServers}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">TURN Servers</span>
                      <Badge variant="secondary">{serverHealth.turnServers}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Working Servers</span>
                      <Badge variant={serverHealth.workingServers === serverHealth.totalServers ? 'default' : 'destructive'}>
                        {serverHealth.workingServers}/{serverHealth.totalServers}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">TURN Credentials</span>
                      {serverHealth.hasTurnCredentials ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Server Health</div>
                    <Progress 
                      value={(serverHealth.workingServers / Math.max(serverHealth.totalServers, 1)) * 100}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {serverHealth.workingServers} of {serverHealth.totalServers} servers responding
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Loading server health...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Connection Quality Details</CardTitle>
              <CardDescription>
                Real-time connection quality metrics for each participant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(connectionQualities).length > 0 ? (
                  Object.entries(connectionQualities).map(([peerId, quality]) => (
                    <ConnectionQualityIndicator
                      key={peerId}
                      quality={quality}
                      userId={peerId}
                      showDetails={true}
                      className="p-3 border rounded-lg"
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wifi className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active connections</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Tab */}
        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Current session state and persistence details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionStats ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium">Session ID:</span>
                    <p className="text-sm text-muted-foreground font-mono">{sessionStats.sessionId}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <p className="text-sm">
                      <Badge variant={sessionStats.status === 'active' ? 'default' : 'secondary'}>
                        {sessionStats.status}
                      </Badge>
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Start Time:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sessionStats.startTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Last Activity:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sessionStats.lastActivity).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium">Participants:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sessionStats.participants.map((participant) => (
                        <Badge key={participant} variant="outline" className="text-xs">
                          {participant === userId ? 'You' : participant.slice(0, 8)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No active session
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebRTCDashboard;