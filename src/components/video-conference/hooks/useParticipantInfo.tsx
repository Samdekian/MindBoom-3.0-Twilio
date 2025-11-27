
import { useState, useCallback } from "react";

export interface ParticipantInfo {
  name: string;
  email: string;
}

export function useParticipantInfo() {
  const [patientInfo, setPatientInfo] = useState<ParticipantInfo | null>(null);
  const [therapistInfo, setTherapistInfo] = useState<ParticipantInfo | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<string | null>(null);

  const handleParticipantInfoLoaded = useCallback(
    (
      patientData: ParticipantInfo | null,
      therapistData: ParticipantInfo | null,
      emergencyContactData: string | null
    ) => {
      setPatientInfo(patientData);
      setTherapistInfo(therapistData);
      setEmergencyContact(emergencyContactData);
    },
    []
  );

  return {
    patientInfo,
    therapistInfo,
    emergencyContact,
    handleParticipantInfoLoaded
  };
}
