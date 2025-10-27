import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePatientAnalytics } from '@/hooks/use-patient-analytics';
import { Badge } from '@/components/ui/badge';

const PatientAnalyticsTab: React.FC = () => {
  const { sessionData, goalProgress, isLoading } = usePatientAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Analytics</CardTitle>
        <CardDescription>Overview of patient progress and engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Attendance</CardTitle>
              <CardDescription>Number of sessions attended over time</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No session data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
              <CardDescription>Overview of patient engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{sessionData.reduce((sum, item) => sum + item.value, 0)}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{sessionData.length}</div>
                  <div className="text-sm text-muted-foreground">Active Months</div>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">
                Real patient data from Supabase
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Progress towards treatment goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={goalProgress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Current Progress</span>
              <span>{Math.round(goalProgress)}%</span>
            </div>
            <Badge variant="outline">
              Based on completed sessions
            </Badge>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default PatientAnalyticsTab;
