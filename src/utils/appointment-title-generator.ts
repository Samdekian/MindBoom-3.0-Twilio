
interface ProfileWithDetails {
  id: string;
  full_name: string;
  phone_number?: string;
  account_type?: string;
  languages_spoken?: string[];
  bio?: string;
}

interface AppointmentData {
  id: string;
  title?: string;
  patient?: ProfileWithDetails;
  therapist?: ProfileWithDetails;
  patient_profile?: ProfileWithDetails;
  therapist_profile?: ProfileWithDetails;
}

/**
 * Generates a dynamic appointment title based on user role and participant data
 * Completely overrides database titles to ensure consistency
 */
export const generateAppointmentTitle = (
  appointment: AppointmentData,
  userRole: 'patient' | 'therapist'
): string => {
  // Determine the other participant based on user role with fallback handling
  const otherParticipantProfile = userRole === 'therapist' 
    ? (appointment.patient_profile || appointment.patient)
    : (appointment.therapist_profile || appointment.therapist);

  // Determine session type from original title if available
  const isInitialConsultation = appointment.title?.toLowerCase().includes('initial consultation') || 
                                appointment.title?.toLowerCase().includes('consultation');
  const sessionType = isInitialConsultation ? 'Initial Consultation' : 'Session';

  // Generate title based on participant data
  if (otherParticipantProfile?.full_name) {
    const participantName = otherParticipantProfile.full_name;
    return `${sessionType} with ${participantName}`;
  }
  
  // Fallback when profile data is missing
  const participantType = userRole === 'therapist' ? 'Patient' : 'Therapist';
  return `${sessionType} with ${participantType}`;
};

/**
 * Gets display name for the other participant with fallback
 */
export const getOtherParticipantName = (
  appointment: AppointmentData,
  userRole: 'patient' | 'therapist'
): string => {
  const otherParticipantProfile = userRole === 'therapist' 
    ? (appointment.patient_profile || appointment.patient)
    : (appointment.therapist_profile || appointment.therapist);

  return otherParticipantProfile?.full_name || 
    (userRole === 'therapist' ? 'Unknown Patient' : 'Unknown Therapist');
};

/**
 * Checks if participant profile data is available
 */
export const hasParticipantProfileData = (
  appointment: AppointmentData,
  userRole: 'patient' | 'therapist'
): boolean => {
  const otherParticipantProfile = userRole === 'therapist' 
    ? (appointment.patient_profile || appointment.patient)
    : (appointment.therapist_profile || appointment.therapist);

  return !!(otherParticipantProfile?.full_name);
};
