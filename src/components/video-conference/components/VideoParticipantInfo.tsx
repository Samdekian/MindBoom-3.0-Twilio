
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VideoParticipantInfoProps {
  appointmentDetails: {
    title: string;
    patient_id: string;
    therapist_id: string;
    recording_consent?: boolean | null;
  };
  onParticipantInfoLoaded: (patient: any, therapist: any, emergencyContact: string | null) => void;
}

const VideoParticipantInfo: React.FC<VideoParticipantInfoProps> = ({
  appointmentDetails,
  onParticipantInfoLoaded
}) => {
  useEffect(() => {
    const fetchParticipantInfo = async () => {
      try {
        const [patientQuery, therapistQuery] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", appointmentDetails.patient_id)
            .single(),
          supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", appointmentDetails.therapist_id)
            .single()
        ]);
        
        // Check for errors in queries
        if (patientQuery.error || !patientQuery.data) {
          console.error("Error fetching patient info:", patientQuery.error);
        }
        
        if (therapistQuery.error || !therapistQuery.data) {
          console.error("Error fetching therapist info:", therapistQuery.error);
        }
        
        // Safely extract data
        const patientInfo = patientQuery.data ? {
          name: patientQuery.data.full_name,
          id: patientQuery.data.id // Using ID instead of email
        } : null;
        
        const therapistInfo = therapistQuery.data ? {
          name: therapistQuery.data.full_name,
          id: therapistQuery.data.id // Using ID instead of email
        } : null;
        
        // Get emergency contact separately - check if the table exists in schema
        let emergencyContact = null;
        
        // We'll search for emergency contact in profiles instead since emergency_contacts table doesn't exist
        if (patientQuery.data) {
          // Use profiles table instead, assuming it might have emergency_contact field
          // If not, we'll just return null for emergency contact
          const profileData = await supabase
            .from("profiles")
            .select("id")
            .eq("id", patientQuery.data.id)
            .maybeSingle();
            
          // For now, we'll just use null for emergency contact until the schema is updated
          emergencyContact = null;
        }
        
        onParticipantInfoLoaded(patientInfo, therapistInfo, emergencyContact);
      } catch (error) {
        console.error("Error fetching participant info:", error);
        onParticipantInfoLoaded(null, null, null);
      }
    };
    
    fetchParticipantInfo();
  }, [appointmentDetails, onParticipantInfoLoaded]);
  
  return null;
};

export default VideoParticipantInfo;
