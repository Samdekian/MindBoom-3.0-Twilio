import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { usePerformanceMonitor } from "@/services/performance-monitor";
import { cacheService } from "@/services/cache-service";
import { performanceMonitor } from "@/services/performance-monitor";
import PerformanceOptimization from "@/components/project-documentation/performance/PerformanceOptimization";

const mockPerformanceData = {
  loadTimes: [
    { name: "Initial Load", previous: 2.8, current: 1.8 },
    { name: "Dashboard", previous: 1.6, current: 0.9 },
    { name: "Calendar", previous: 1.9, current: 1.2 },
    { name: "Profile", previous: 1.2, current: 0.7 },
    { name: "Video Session", previous: 2.3, current: 1.3 }
  ],
  memoryUsage: [
    { name: "Initial Load", previous: 32, current: 26 },
    { name: "Dashboard", previous: 41, current: 29 },
    { name: "Calendar", previous: 38, current: 31 },
    { name: "Profile", previous: 27, current: 22 },
    { name: "Video Session", previous: 45, current: 33 }
  ],
  cacheHits: [
    { name: "Calendar Data", hits: 142, misses: 23 },
    { name: "User Profiles", hits: 89, misses: 11 },
    { name: "Appointments", hits: 176, misses: 31 },
    { name: "Session Data", hits: 67, misses: 15 },
    { name: "Configuration", hits: 28, misses: 3 }
  ],
  bundleSizes: [
    { name: "main", previous: 1250, current: 380 },
    { name: "react-vendor", previous: 0, current: 210 },
    { name: "ui-components", previous: 0, current: 180 },
    { name: "charts", previous: 0, current: 150 },
    { name: "other", previous: 350, current: 290 }
  ],
  timelineData: Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    responseTime: Math.random() * 500 + 100,
    userCount: Math.floor(Math.random() * 50) + 10
  }))
};

const PerformanceDashboard = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const { trackOperation } = usePerformanceMonitor("PerformanceDashboard");

  const runPerformanceTest = (testName: string) => {
    setActiveTest(testName);
    const endTimer = trackOperation(`perf-test-${testName}`);
    
    setTimeout(() => {
      setActiveTest(null);
      endTimer();
    }, 1500);
  };

  const clearAllCaches = () => {
    cacheService.clear();
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Page Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">1.8s</div>
            <p className="text-sm text-muted-foreground">42% faster than before</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Bundle Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">245KB</div>
            <p className="text-sm text-muted-foreground">38% reduction</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">86%</div>
            <p className="text-sm text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="metrics">
        <TabsList className="w-full grid grid-cols-1 md:grid-cols-4 mb-8">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="caching">Cache Efficiency</TabsTrigger>
          <TabsTrigger value="progress">Optimization Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Times (seconds)</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockPerformanceData.loadTimes}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value}s`]} />
                      <Legend />
                      <Bar dataKey="previous" name="Before Optimization" fill="#94a3b8" />
                      <Bar dataKey="current" name="After Optimization" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Time & Active Users</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockPerformanceData.timelineData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#0ea5e9" name="Response Time (ms)" />
                      <Line yAxisId="right" type="monotone" dataKey="userCount" stroke="#8b5cf6" name="Active Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => runPerformanceTest("memoryProfile")}
              disabled={!!activeTest}
            >
              {activeTest === "memoryProfile" ? "Running Memory Profile..." : "Run Memory Profile"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runPerformanceTest("networkAnalysis")}
              disabled={!!activeTest}
            >
              {activeTest === "networkAnalysis" ? "Analyzing Network..." : "Run Network Analysis"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => runPerformanceTest("renderAnalysis")}
              disabled={!!activeTest}
            >
              {activeTest === "renderAnalysis" ? "Analyzing Renders..." : "Run Render Analysis"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="bundles">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Size Comparison (KB)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockPerformanceData.bundleSizes}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}KB`]} />
                    <Legend />
                    <Bar dataKey="previous" name="Before Code Splitting" fill="#94a3b8" />
                    <Bar dataKey="current" name="After Code Splitting" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Key Optimizations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Code splitting into functionality-based chunks</li>
                  <li>Tree shaking of unused dependencies</li>
                  <li>Dynamic imports for non-critical components</li>
                  <li>Separate vendor bundles for better caching</li>
                  <li>Lazy loading of routes and major feature components</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="caching">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cache Performance</CardTitle>
                <Button variant="outline" onClick={clearAllCaches}>
                  Clear All Caches
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockPerformanceData.cacheHits}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis />
                    <YAxis />
                    <Tooltip formatter={(value, name, props) => {
                      if (props && props.payload) {
                        const total = props.payload.hits + props.payload.misses;
                        return [`${value} (${Math.round((Number(value) / total) * 100)}%)`, name];
                      }
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar dataKey="hits" name="Cache Hits" fill="#22c55e" />
                    <Bar dataKey="misses" name="Cache Misses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Cache Strategy Details</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tanstack Query with optimized cache settings (5-minute stale time)</li>
                  <li>Calendar data cached with expiration patterns based on access frequency</li>
                  <li>User profile data cached with shorter TTL for security</li>
                  <li>Session data aggressively cached during active sessions</li>
                  <li>Configuration data cached until explicitly invalidated</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <PerformanceOptimization />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
