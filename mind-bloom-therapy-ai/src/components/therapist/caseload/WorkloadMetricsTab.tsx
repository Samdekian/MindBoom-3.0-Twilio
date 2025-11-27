import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Users, Calendar, TrendingUp } from 'lucide-react';
import { useWorkloadMetrics } from '@/hooks/use-workload-metrics';
import { Badge } from '@/components/ui/badge';

interface WorkloadMetricsTabProps {
  // Define any props here
}

const WorkloadMetricsTab: React.FC<WorkloadMetricsTabProps> = () => {
  const { metrics, isLoading } = useWorkloadMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workload Metrics</CardTitle>
          <CardDescription>Loading workload data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const { caseloadSize, averageSessionDuration, weeklyHoursWorked, patientSatisfaction, caseloadData } = metrics;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Workload Metrics</CardTitle>
          <CardDescription>Overview of your current workload</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center space-x-4 p-4">
                <Users className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{caseloadSize}</div>
                  <div className="text-sm text-muted-foreground">Caseload Size</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4 p-4">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{averageSessionDuration} min</div>
                  <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center space-x-4 p-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{weeklyHoursWorked} hrs</div>
                  <div className="text-sm text-muted-foreground">Weekly Hours Worked</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center space-x-4 p-4">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{(patientSatisfaction * 100).toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Badge variant="secondary" className="w-fit">
            Real data from Supabase
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caseload Distribution</CardTitle>
          <CardDescription>Distribution of patients by primary issue</CardDescription>
        </CardHeader>
        <CardContent>
          {caseloadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caseloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No patient data available for distribution analysis
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkloadMetricsTab;
