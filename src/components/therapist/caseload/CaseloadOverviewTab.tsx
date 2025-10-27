import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const CaseloadOverviewTab: React.FC = () => {
  const { user } = useAuthRBAC();

  // Mock data for demonstration
  const totalPatients = 50;
  const activePatients = 42;
  const avgSessionDuration = 45;
  const adherenceRate = 85;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caseload Overview</CardTitle>
        <CardDescription>Summary of your current patient load and engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <div className="text-muted-foreground text-sm">All patients assigned to you</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePatients}</div>
              <div className="text-muted-foreground text-sm">Patients with recent sessions</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgSessionDuration} mins</div>
              <div className="text-muted-foreground text-sm">Average time spent per session</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Treatment Adherence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adherenceRate}%</div>
              <div className="text-muted-foreground text-sm">Patients following treatment plans</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Caseload Distribution</CardTitle>
              <CardDescription>Distribution of patients by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span>Low Risk</span>
                <Badge variant="outline">30%</Badge>
              </div>
              <Progress value={30} className="mb-4" />

              <div className="flex items-center justify-between mb-2">
                <span>Medium Risk</span>
                <Badge variant="secondary">50%</Badge>
              </div>
              <Progress value={50} className="mb-4" />

              <div className="flex items-center justify-between mb-2">
                <span>High Risk</span>
                <Badge variant="destructive">20%</Badge>
              </div>
              <Progress value={20} />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseloadOverviewTab;
