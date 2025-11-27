
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, Heart } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface OnboardingWelcomeBannerProps {
  onOpenOnboardingFlow?: () => void;
}

export const OnboardingWelcomeBanner: React.FC<OnboardingWelcomeBannerProps> = ({ 
  onOpenOnboardingFlow 
}) => {
  const { state, setStep } = useOnboarding();

  const steps = [
    {
      key: 'therapist' as const,
      title: 'Choose Your Therapist',
      description: 'Find the right match for your needs',
      completed: state.hasSelectedTherapist,
    },
    {
      key: 'session' as const,
      title: 'Schedule First Session',
      description: 'Book your initial consultation',
      completed: state.hasScheduledFirstSession,
    },
    {
      key: 'goals' as const,
      title: 'Set Your Goals',
      description: 'Define what you want to achieve',
      completed: state.hasSetInitialGoals,
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const currentStepIndex = steps.findIndex(step => !step.completed);
  const currentStepData = currentStepIndex !== -1 ? steps[currentStepIndex] : null;

  const handleContinue = () => {
    if (currentStepData) {
      setStep(currentStepData.key);
      onOpenOnboardingFlow?.();
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Welcome to Your Mental Health Journey
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Let's get you started with just a few simple steps
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Setup Progress</span>
            <span className="text-gray-600">{completedSteps} of {steps.length} complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
                step.completed
                  ? 'bg-green-50 border border-green-200'
                  : currentStepData?.key === step.key
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  currentStepData?.key === step.key ? 'text-blue-600' : 'text-gray-400'
                }`} />
              )}
              <div className="min-w-0">
                <h3 className={`font-medium ${
                  step.completed ? 'text-green-800' : currentStepData?.key === step.key ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${
                  step.completed ? 'text-green-600' : currentStepData?.key === step.key ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {!state.isOnboardingComplete && currentStepData && (
          <div className="flex items-center justify-between bg-white/70 p-4 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Next Step</h4>
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            </div>
            <Button onClick={handleContinue} className="flex items-center gap-2">
              {currentStepData.title}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {state.isOnboardingComplete && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Setup Complete!</h4>
                <p className="text-sm text-green-600">
                  You're all set to begin your therapy journey. Explore your dashboard below.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
