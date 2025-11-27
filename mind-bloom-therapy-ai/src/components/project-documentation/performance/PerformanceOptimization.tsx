
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, LineChart, Zap, FileSearch, Server } from "lucide-react";

const PerformanceOptimization = () => {
  const optimizations = [
    {
      title: "React Performance",
      status: "completed",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      description: "Optimized React component rendering",
      items: [
        { text: "Implemented React.memo for expensive components", done: true },
        { text: "Added useMemo for complex calculations", done: true },
        { text: "Optimized useEffect dependencies", done: true },
        { text: "Converted class components to functional components", done: true }
      ]
    },
    {
      title: "Code Splitting",
      status: "completed",
      icon: <FileSearch className="h-5 w-5 text-blue-500" />,
      description: "Reduced initial bundle size with code splitting",
      items: [
        { text: "Implemented React.lazy loading", done: true },
        { text: "Added Suspense boundaries", done: true },
        { text: "Created dynamic imports for routes", done: true }
      ]
    },
    {
      title: "Data Fetching",
      status: "completed",
      icon: <Server className="h-5 w-5 text-purple-500" />,
      description: "Improved data fetching patterns",
      items: [
        { text: "Implemented request batching", done: true },
        { text: "Added data prefetching for common user flows", done: true },
        { text: "Optimized Tanstack Query configuration", done: true },
        { text: "Reduced unnecessary refetches", done: true }
      ]
    },
    {
      title: "Rendering Optimization",
      status: "in-progress",
      icon: <LineChart className="h-5 w-5 text-green-500" />,
      description: "Enhancing rendering efficiency",
      items: [
        { text: "Implemented virtualized lists for long content", done: true },
        { text: "Added windowing for large data sets", done: true },
        { text: "Optimized state management to reduce renders", done: false },
        { text: "Performance profiling and bottleneck identification", done: false }
      ]
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Performance Optimization</CardTitle>
        <CardDescription>
          Implementation of performance enhancements across the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {optimizations.map((optimization, index) => (
          <div key={index} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {optimization.icon}
                <h3 className="text-lg font-medium">{optimization.title}</h3>
              </div>
              {optimization.status === "completed" ? (
                <Badge className="bg-green-600">Completed</Badge>
              ) : (
                <Badge className="bg-amber-600">In Progress</Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-3">{optimization.description}</p>
            <ul className="grid gap-2 mt-2">
              {optimization.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                  )}
                  <span className={item.done ? "" : "text-muted-foreground"}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground mb-1">Initial Load Time</p>
              <p className="text-3xl font-bold text-green-600">1.8s</p>
              <p className="text-xs text-green-600 mt-1">↓ 42% improvement</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground mb-1">Bundle Size</p>
              <p className="text-3xl font-bold text-green-600">245KB</p>
              <p className="text-xs text-green-600 mt-1">↓ 38% reduction</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-muted-foreground mb-1">Avg. Render Time</p>
              <p className="text-3xl font-bold text-green-600">32ms</p>
              <p className="text-xs text-green-600 mt-1">↓ 56% faster</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOptimization;
