import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, Clock, Plus } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface TreatmentGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'on_hold';
}

const PatientTreatmentTab: React.FC = () => {
  const { user } = useAuthRBAC();
  const [treatmentGoals, setTreatmentGoals] = useState<TreatmentGoal[]>([
    {
      id: '1',
      title: 'Reduce Anxiety',
      description: 'Develop coping mechanisms to manage anxiety symptoms.',
      progress: 60,
      status: 'active',
    },
    {
      id: '2',
      title: 'Improve Mood',
      description: 'Engage in activities that promote positive emotions and well-being.',
      progress: 30,
      status: 'active',
    },
    {
      id: '3',
      title: 'Enhance Communication',
      description: 'Practice assertive communication techniques in daily interactions.',
      progress: 100,
      status: 'completed',
    },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Plan</CardTitle>
        <CardDescription>Overview of the patient's treatment goals and progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {treatmentGoals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.title}</CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Progress:</span>
                  <Badge variant="secondary">{goal.progress}%</Badge>
                </div>
                <Progress value={goal.progress} />
                <div className="flex justify-end mt-2">
                  {goal.status === 'active' ? (
                    <Badge variant="outline">Active</Badge>
                  ) : goal.status === 'completed' ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Badge variant="destructive">On Hold</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
      </CardContent>
    </Card>
  );
};

export default PatientTreatmentTab;
