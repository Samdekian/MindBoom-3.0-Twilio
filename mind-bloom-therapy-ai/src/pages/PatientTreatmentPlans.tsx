
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, CheckCircle } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const PatientTreatmentPlans = () => {
  const { user } = useAuthRBAC();

  // Mock data - replace with actual data fetching
  const treatmentPlans = [
    {
      id: "1",
      title: "Anxiety Management Plan",
      description: "Comprehensive plan to manage anxiety symptoms through CBT techniques",
      status: "active",
      progress: 65,
      startDate: "2024-01-01",
      endDate: "2024-04-01",
      therapist: "Dr. Jane Smith",
      goals: [
        { id: "1", title: "Learn breathing techniques", completed: true },
        { id: "2", title: "Practice mindfulness daily", completed: true },
        { id: "3", title: "Identify anxiety triggers", completed: false },
        { id: "4", title: "Develop coping strategies", completed: false }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Treatment Plans | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Treatment Plans</h1>
          <p className="text-muted-foreground">
            Track your progress and view your personalized treatment plans
          </p>
        </div>

        <div className="grid gap-6">
          {treatmentPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(plan.status)} text-white`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>

                  {/* Plan Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Start: {plan.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">End: {plan.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Therapist: {plan.therapist}</span>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Treatment Goals</h4>
                    <div className="space-y-2">
                      {plan.goals.map((goal) => (
                        <div key={goal.id} className="flex items-center gap-3">
                          <CheckCircle 
                            className={`h-4 w-4 ${
                              goal.completed ? 'text-green-500' : 'text-gray-300'
                            }`}
                          />
                          <span className={`text-sm ${
                            goal.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {goal.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {treatmentPlans.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Treatment Plans Yet</h3>
              <p className="text-muted-foreground text-center">
                Your personalized treatment plans will appear here once created by your therapist.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientTreatmentPlans;
