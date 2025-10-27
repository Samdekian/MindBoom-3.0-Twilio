
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const ProgressMetrics = () => {
  // Mock wellbeing score data - in real implementation, this would come from the database
  const wellbeingData = [
    { week: "Week 1", score: 65 },
    { week: "Week 2", score: 70 },
    { week: "Week 3", score: 68 },
    { week: "Week 4", score: 72 },
    { week: "Week 5", score: 75 },
    { week: "Week 6", score: 79 },
    { week: "Week 7", score: 82 },
    { week: "Week 8", score: 85 },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Wellbeing Progress</CardTitle>
          <CardDescription>Your journey over time</CardDescription>
        </div>
        <Badge className="bg-green-600 flex items-center">
          <TrendingUp className="h-3.5 w-3.5 mr-1" />
          +8% This Month
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ChartContainer
            config={{
              wellbeing: { color: "#8b5cf6" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={wellbeingData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[60, 90]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => [`Wellbeing Score: ${value}`]} />}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, stroke: "#8b5cf6" }}
                  activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Current Score", value: "85/100", trend: "+3" },
            { label: "Sessions", value: "12", trend: "+2" },
            { label: "Goals", value: "3/5", trend: "+1" },
            { label: "Consistency", value: "94%", trend: "+6%" },
          ].map((metric, index) => (
            <div 
              key={index}
              className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className="flex items-center mt-1">
                <p className="text-xl font-bold">{metric.value}</p>
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressMetrics;
