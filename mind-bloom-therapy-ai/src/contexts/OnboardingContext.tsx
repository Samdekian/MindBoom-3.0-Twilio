import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

interface OnboardingState {
  hasScheduledFirstSession: boolean;
  hasSelectedTherapist: boolean;
  hasSetInitialGoals: boolean;
  isOnboardingComplete: boolean;
  currentStep: 'therapist' | 'session' | 'goals' | 'complete';
}

interface OnboardingContextType {
  state: OnboardingState;
  setStep: (step: OnboardingState['currentStep']) => void;
  markStepComplete: (step: keyof Pick<OnboardingState, 'hasScheduledFirstSession' | 'hasSelectedTherapist' | 'hasSetInitialGoals'>) => void;
  isLoading: boolean;
  refetch: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { data: onboardingData, isLoading, refetch } = useOnboardingStatus();
  const [currentStep, setCurrentStep] = useState<OnboardingState['currentStep']>('therapist');

  const state: OnboardingState = {
    hasScheduledFirstSession: onboardingData?.hasScheduledFirstSession || false,
    hasSelectedTherapist: onboardingData?.hasSelectedTherapist || false,
    hasSetInitialGoals: onboardingData?.hasSetInitialGoals || false,
    isOnboardingComplete: onboardingData?.isOnboardingComplete || false,
    currentStep,
  };

  // Auto-determine current step based on completion status
  useEffect(() => {
    if (!onboardingData) return;

    if (!onboardingData.hasSelectedTherapist) {
      setCurrentStep('therapist');
    } else if (!onboardingData.hasScheduledFirstSession) {
      setCurrentStep('session');
    } else if (!onboardingData.hasSetInitialGoals) {
      setCurrentStep('goals');
    } else {
      setCurrentStep('complete');
    }
  }, [onboardingData]);

  const setStep = (step: OnboardingState['currentStep']) => {
    setCurrentStep(step);
  };

  const markStepComplete = (step: keyof Pick<OnboardingState, 'hasScheduledFirstSession' | 'hasSelectedTherapist' | 'hasSetInitialGoals'>) => {
    // This would typically update the backend, but for now we'll rely on refetch
    refetch();
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setStep,
        markStepComplete,
        isLoading,
        refetch,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};