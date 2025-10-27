import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingTherapistDirectory } from '@/components/booking/OnboardingTherapistDirectory';
import { OnboardingScheduleModal } from '@/components/booking/OnboardingScheduleModal';
import { GoalsSetupWizard } from './GoalsSetupWizard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthRBAC();
  const { state } = useOnboarding();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Get selected therapist for scheduling
  const { data: selectedTherapist } = useQuery({
    queryKey: ['selected-therapist', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('patient_therapist_relationships')
        .select('therapist_id')
        .eq('patient_id', user.id)
        .eq('relationship_status', 'active')
        .single();

      if (error) return null;
      return data?.therapist_id || null;
    },
    enabled: !!user?.id && state.hasSelectedTherapist,
  });

  // Auto-open schedule modal when therapist is selected
  React.useEffect(() => {
    if (state.hasSelectedTherapist && !state.hasScheduledFirstSession && selectedTherapist) {
      setShowScheduleModal(true);
    }
  }, [state.hasSelectedTherapist, state.hasScheduledFirstSession, selectedTherapist]);

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'therapist':
        return <OnboardingTherapistDirectory />;
      case 'session':
        return selectedTherapist ? (
          <>
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Great! You've selected your therapist.</h2>
              <p className="text-muted-foreground mb-4">Now let's schedule your first session.</p>
            </div>
            <OnboardingScheduleModal
              isOpen={showScheduleModal}
              onClose={() => setShowScheduleModal(false)}
              therapistId={selectedTherapist}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading therapist information...</p>
          </div>
        );
      case 'goals':
        return <GoalsSetupWizard />;
      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
              <p className="text-gray-600 mb-6">
                You've completed your onboarding. Your therapy journey starts now!
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Explore Your Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showScheduleModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {renderCurrentStep()}
        </DialogContent>
      </Dialog>
      
      {/* Schedule modal is handled separately to avoid nesting dialog issues */}
      {selectedTherapist && (
        <OnboardingScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          therapistId={selectedTherapist}
        />
      )}
    </>
  );
};