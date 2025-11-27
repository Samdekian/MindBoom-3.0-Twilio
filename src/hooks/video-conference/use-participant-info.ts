
import { useState, useEffect } from 'react';
import { ParticipantInfo } from './types';

export interface UseParticipantInfoReturn {
  patientInfo: ParticipantInfo | null;
  therapistInfo: ParticipantInfo | null;
  isTherapist: boolean;
  isPatient: boolean;
  emergencyContact: string;
  handleParticipantInfoLoaded: (patient: ParticipantInfo, therapist: ParticipantInfo, emergency: string) => void;
}

export function useParticipantInfo(sessionId: string): UseParticipantInfoReturn {
  const [patientInfo, setPatientInfo] = useState<ParticipantInfo | null>(null);
  const [therapistInfo, setTherapistInfo] = useState<ParticipantInfo | null>(null);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isTherapist, setIsTherapist] = useState(false);
  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    // Mock participant info loading
    const mockTherapist: ParticipantInfo = {
      id: 'therapist-1',
      name: 'Dr. Sarah Johnson',
      role: 'therapist',
      avatar: undefined,
    };

    const mockPatient: ParticipantInfo = {
      id: 'patient-1',
      name: 'John Doe',
      role: 'patient',
      avatar: undefined,
    };

    setTherapistInfo(mockTherapist);
    setPatientInfo(mockPatient);
    setIsTherapist(true); // Mock: current user is therapist
    setIsPatient(false);
    setEmergencyContact('911');
  }, [sessionId]);

  const handleParticipantInfoLoaded = (
    patient: ParticipantInfo, 
    therapist: ParticipantInfo, 
    emergency: string
  ) => {
    setPatientInfo(patient);
    setTherapistInfo(therapist);
    setEmergencyContact(emergency);
  };

  return {
    patientInfo,
    therapistInfo,
    isTherapist,
    isPatient,
    emergencyContact,
    handleParticipantInfoLoaded,
  };
}
