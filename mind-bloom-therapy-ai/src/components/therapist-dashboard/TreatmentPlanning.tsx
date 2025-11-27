import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, CheckCircle, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'completed' | 'onHold';
}

interface Goal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'notStarted' | 'inProgress' | 'completed' | 'failed';
  progress: number;
}

const TreatmentPlanning: React.FC = () => {
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([
    {
      id: '1',
      title: 'Anxiety Reduction Plan',
      description: 'A plan to reduce anxiety symptoms through cognitive and behavioral techniques.',
      goals: [
        {
          id: '101',
          description: 'Reduce daily anxiety episodes',
          targetDate: new Date(2024, 5, 20),
          status: 'inProgress',
          progress: 60,
        },
        {
          id: '102',
          description: 'Improve sleep quality',
          targetDate: new Date(2024, 6, 15),
          status: 'notStarted',
          progress: 0,
        },
      ],
      startDate: new Date(2024, 4, 1),
      endDate: new Date(2024, 7, 31),
      status: 'active',
    },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Planning</CardTitle>
        <CardDescription>Manage and track patient treatment plans and goals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Treatment Plans</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-2">
            <p>Quick overview of active treatment plans and progress.</p>
            {treatmentPlans.map((plan) => (
              <div key={plan.id} className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold">{plan.title}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <Progress value={65} className="mt-2" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{plan.status}</span>
                  <span>65% Complete</span>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="plans" className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-semibold">Current Treatment Plans</h4>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Plan
              </Button>
            </div>
            {treatmentPlans.map((plan) => (
              <div key={plan.id} className="border p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Start Date: {plan.startDate.toLocaleDateString()}</span>
                  <span>End Date: {plan.endDate.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="goals" className="space-y-2">
            <h4 className="text-md font-semibold">Treatment Goals</h4>
            {treatmentPlans.map((plan) => (
              <div key={plan.id} className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold">{plan.title} Goals</h3>
                {plan.goals.map((goal) => (
                  <div key={goal.id} className="mt-2">
                    <p className="text-sm">{goal.description}</p>
                    <Progress value={goal.progress} className="mt-1" />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Status: {goal.status}</span>
                      <span>{goal.progress}% Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanning;
