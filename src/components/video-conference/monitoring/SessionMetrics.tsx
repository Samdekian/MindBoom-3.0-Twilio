
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VideoQuality, ConnectionQuality } from "@/types/video-conference";

interface MetricsPoint {
  timestamp: number;
  rtt?: number;
  packetsLost?: number;
  jitter?: number;
  bandwidth?: number;
}

interface SessionMetricsProps {
  metricsHistory: MetricsPoint[];
  currentQuality: {
    connectionQuality: ConnectionQuality;
    videoQuality: VideoQuality;
  };
  sessionDuration: number;
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
  };
}

const SessionMetrics: React.FC<SessionMetricsProps> = ({
  metricsHistory,
  currentQuality,
  sessionDuration,
  deviceInfo
}) => {
  // Format data for charts
  const chartData = metricsHistory.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    rtt: point.rtt || 0,
    packetsLost: point.packetsLost || 0,
    jitter: point.jitter || 0,
    bandwidth: point.bandwidth ? Math.round(point.bandwidth / 1000) : 0 // Convert to Kbps
  }));

  // Calculate averages
  const calculateAverage = (key: keyof MetricsPoint): number => {
    const values = metricsHistory.map(point => point[key] as number || 0);
    return values.length > 0 
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  };
  
  const avgRtt = calculateAverage('rtt');
  const avgPacketsLost = calculateAverage('packetsLost');
  const avgJitter = calculateAverage('jitter');
  const avgBandwidth = calculateAverage('bandwidth');

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Session Performance Metrics</CardTitle>
          <CardDescription>
            Real-time monitoring of session quality and connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground">Connection Quality</div>
              <div className={`font-semibold text-lg capitalize
                ${currentQuality.connectionQuality === 'excellent' ? 'text-green-600' : 
                  currentQuality.connectionQuality === 'good' ? 'text-blue-600' : 
                  currentQuality.connectionQuality === 'poor' ? 'text-yellow-600' : 'text-red-600'}`}
              >
                {currentQuality.connectionQuality}
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground">Video Quality</div>
              <div className="font-semibold text-lg capitalize">
                {currentQuality.videoQuality}
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground">Session Duration</div>
              <div className="font-semibold text-lg">
                {formatDuration(sessionDuration)}
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground">Avg Latency</div>
              <div className="font-semibold text-lg">
                {avgRtt} ms
              </div>
            </div>
          </div>
          
          {metricsHistory.length > 0 && (
            <>
              <div className="h-72 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      interval="preserveStartEnd" 
                      minTickGap={30}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rtt" 
                      name="Latency (ms)" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="jitter" 
                      name="Jitter (ms)" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      interval="preserveStartEnd" 
                      minTickGap={30}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="bandwidth" 
                      name="Bandwidth (Kbps)" 
                      stroke="#ff7300" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="packetsLost" 
                      name="Packets Lost" 
                      stroke="#ff0000" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          
          {deviceInfo && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Client Info</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Browser</TableHead>
                    <TableHead>Operating System</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{deviceInfo.browser}</TableCell>
                    <TableCell>{deviceInfo.os}</TableCell>
                    <TableCell>{deviceInfo.device}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionMetrics;
