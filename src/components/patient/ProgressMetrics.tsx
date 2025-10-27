
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Calendar } from "lucide-react";

const ProgressMetrics = () => {
  // Mock data - replace with real data from API
  const metrics = {
    sessionsCompleted: 12,
    totalSessions: 16,
    currentStreak: 3,
    improvementScore: 78
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Progress Overview
        </CardTitle>
        <CardDescription>Your therapy journey metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{metrics.sessionsCompleted}</p>
            <p className="text-sm text-blue-600">Sessions Completed</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{metrics.currentStreak}</p>
            <p className="text-sm text-green-600">Week Streak</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Improvement Score</span>
            <span className="text-sm font-bold text-purple-800">{metrics.improvementScore}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${metrics.improvementScore}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressMetrics;
