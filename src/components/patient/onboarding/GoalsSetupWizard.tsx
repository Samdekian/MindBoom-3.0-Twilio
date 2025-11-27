import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Target, Plus, CheckCircle, ChevronRight, Calendar } from 'lucide-react';
import { goalTemplates, getCategoryColor, type GoalTemplate } from '@/data/goal-templates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { addWeeks, format } from 'date-fns';

interface SelectedGoal extends GoalTemplate {
  customDescription?: string;
  targetDate?: Date;
}

export const GoalsSetupWizard = () => {
  const { user } = useAuthRBAC();
  const { markStepComplete, setStep } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStepLocal] = useState<'select' | 'customize' | 'summary'>('select');
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([]);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  const createGoalsMutation = useMutation({
    mutationFn: async (goals: SelectedGoal[]) => {
      if (!user?.id) throw new Error("User not authenticated");

      const goalInserts = goals.map(goal => ({
        patient_id: user.id,
        title: goal.title,
        description: goal.customDescription || goal.description,
        target_date: goal.targetDate?.toISOString().split('T')[0] || null,
        status: 'active',
        progress_percentage: 0,
      }));

      const { error } = await supabase
        .from('patient_goals')
        .insert(goalInserts);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Goals Created!",
        description: `You've successfully set ${selectedGoals.length} therapy goals.`,
      });
      
      // Invalidate queries to update data
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['patient-goals'] });
      
      // Mark step complete
      markStepComplete('hasSetInitialGoals');
      setStep('complete');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goals. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectGoal = (goal: GoalTemplate) => {
    if (selectedGoals.find(g => g.id === goal.id)) {
      // Remove goal
      setSelectedGoals(prev => prev.filter(g => g.id !== goal.id));
    } else if (selectedGoals.length < 3) {
      // Add goal with default target date
      const targetDate = addWeeks(new Date(), goal.suggestedTimeframe);
      setSelectedGoals(prev => [...prev, { ...goal, targetDate }]);
    }
  };

  const handleCustomizeGoal = (index: number, updates: Partial<SelectedGoal>) => {
    setSelectedGoals(prev => 
      prev.map((goal, i) => i === index ? { ...goal, ...updates } : goal)
    );
  };

  const handleNext = () => {
    if (step === 'select' && selectedGoals.length > 0) {
      setStepLocal('customize');
    } else if (step === 'customize') {
      if (currentGoalIndex < selectedGoals.length - 1) {
        setCurrentGoalIndex(prev => prev + 1);
      } else {
        setStepLocal('summary');
      }
    } else if (step === 'summary') {
      createGoalsMutation.mutate(selectedGoals);
    }
  };

  const handleBack = () => {
    if (step === 'customize' && currentGoalIndex > 0) {
      setCurrentGoalIndex(prev => prev - 1);
    } else if (step === 'customize' && currentGoalIndex === 0) {
      setStepLocal('select');
    } else if (step === 'summary') {
      setCurrentGoalIndex(selectedGoals.length - 1);
      setStepLocal('customize');
    }
  };

  const currentGoal = step === 'customize' ? selectedGoals[currentGoalIndex] : null;

  if (step === 'select') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set Your Therapy Goals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose 1-3 areas you'd like to focus on. You can always adjust these later with your therapist.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalTemplates.map((template) => {
              const isSelected = selectedGoals.find(g => g.id === template.id);
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelectGoal(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    <h3 className="font-medium mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Examples:</p>
                      {template.examples.slice(0, 2).map((example, index) => (
                        <p key={index} className="text-xs text-gray-600">• {example}</p>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Suggested timeframe: {template.suggestedTimeframe} weeks</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedGoals.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Goals ({selectedGoals.length}/3)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGoals.map((goal) => (
                      <Badge key={goal.id} variant="secondary">
                        {goal.title}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Customize Goals
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {selectedGoals.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select goals that resonate with you to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'customize' && currentGoal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Customize Goal {currentGoalIndex + 1} of {selectedGoals.length}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Make this goal more specific to your situation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{currentGoal.title}</h3>
              <Badge className={getCategoryColor(currentGoal.category)}>
                {currentGoal.category}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Description</label>
              <Textarea
                value={currentGoal.customDescription || currentGoal.description}
                onChange={(e) => handleCustomizeGoal(currentGoalIndex, { customDescription: e.target.value })}
                placeholder="Describe what you want to achieve..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                You can personalize this description or keep the default
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Date</label>
              <input
                type="date"
                value={currentGoal.targetDate ? format(currentGoal.targetDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  handleCustomizeGoal(currentGoalIndex, { targetDate: date });
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                When would you like to achieve this goal? (suggested: {currentGoal.suggestedTimeframe} weeks)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={handleBack}>
              {currentGoalIndex === 0 ? 'Back to Selection' : 'Previous Goal'}
            </Button>
            <Button onClick={handleNext} className="flex items-center gap-2">
              {currentGoalIndex === selectedGoals.length - 1 ? 'Review Goals' : 'Next Goal'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'summary') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Review Your Goals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Here's a summary of your therapy goals. You can discuss and adjust these with your therapist.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {selectedGoals.map((goal, index) => (
              <Card key={goal.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                    </div>
                    {goal.targetDate && (
                      <div className="text-sm text-muted-foreground">
                        Target: {format(goal.targetDate, 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {goal.customDescription || goal.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={handleBack}>
              Make Changes
            </Button>
            <Button 
              onClick={handleNext}
              disabled={createGoalsMutation.isPending}
              className="flex items-center gap-2"
            >
              {createGoalsMutation.isPending ? 'Creating Goals...' : 'Create My Goals'}
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};