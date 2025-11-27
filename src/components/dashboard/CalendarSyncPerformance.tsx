
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncMonitoring } from "@/utils/calendar-sync-monitoring";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

/**
 * CalendarSyncPerformance Component
 * 
 * Displays metrics and performance data for calendar synchronization operations
 * 
 * @returns {React.ReactElement} A component showing sync performance stats
 */
const CalendarSyncPerformance: React.FC = () => {
  const [stats, setStats] = useState(syncMonitoring.getStats());
  const [operations, setOperations] = useState(syncMonitoring.getRecentOperations());
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      setStats(syncMonitoring.getStats());
      setOperations(syncMonitoring.getRecentOperations());
      
      // Create chart data from operations
      const chartItems = syncMonitoring.getRecentOperations().map(op => ({
        time: new Date(op.startTime).toLocaleTimeString(),
        duration: op.endTime ? op.endTime - op.startTime : 0,
        type: op.type,
        success: op.success ? 1 : 0,
        failure: op.success ? 0 : 1
      }));
      
      setChartData(chartItems.reverse()); // Show oldest first
    };
    
    // Update on mount
    updateStats();
    
    // Set up interval for refreshing
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Sync Performance</CardTitle>
          <CardDescription>
            Real-time metrics for calendar sync operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Success Rate</span>
              <span className="text-2xl font-bold">
                {stats.successRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Avg Duration</span>
              <span className="text-2xl font-bold">
                {stats.averageDuration.toFixed(1)}ms
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Total Operations</span>
              <span className="text-2xl font-bold">
                {stats.totalOperations}
              </span>
            </div>
          </div>
          
          {chartData.length > 0 && (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#3b82f6" 
                    fill="#3b82f680" 
                    name="Duration (ms)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="success" 
                    stroke="#10b981" 
                    fill="#10b98180" 
                    name="Success" 
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="failure" 
                    stroke="#ef4444" 
                    fill="#ef444480" 
                    name="Failure" 
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {chartData.length === 0 && (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">No sync data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Operations</CardTitle>
          <CardDescription>
            Last {operations.length} calendar operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Duration</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id} className="border-b">
                    <td className="p-2 capitalize">{op.type}</td>
                    <td className="p-2">
                      <span 
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          op.success 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {op.success ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="p-2">
                      {op.endTime 
                        ? `${(op.endTime - op.startTime).toFixed(1)}ms` 
                        : "In progress"}
                    </td>
                    <td className="p-2">{op.itemCount || "-"}</td>
                    <td className="p-2">
                      {new Date(op.startTime).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                
                {operations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No operations recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSyncPerformance;
