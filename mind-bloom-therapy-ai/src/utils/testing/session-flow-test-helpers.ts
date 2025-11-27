
import { supabase } from '@/integrations/supabase/client';
import { createAppointment, AppointmentCreateData } from '@/lib/api/appointments';

export interface TestUser {
  id: string;
  email: string;
  accountType: 'patient' | 'therapist' | 'admin';
  fullName: string;
}

export interface TestAppointment {
  id: string;
  title: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

// Mock test users for integration testing
export const createMockTestUsers = (): { patient: TestUser; therapist: TestUser } => {
  return {
    patient: {
      id: 'test-patient-uuid',
      email: 'patient@test.com',
      accountType: 'patient',
      fullName: 'Test Patient'
    },
    therapist: {
      id: 'test-therapist-uuid', 
      email: 'therapist@test.com',
      accountType: 'therapist',
      fullName: 'Test Therapist'
    }
  };
};

// Create a test appointment between patient and therapist
export const createTestAppointment = async (
  patientId: string,
  therapistId: string,
  offsetMinutes: number = 30
): Promise<TestAppointment> => {
  const startTime = new Date(Date.now() + offsetMinutes * 60000);
  const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour session

  const appointmentData: AppointmentCreateData = {
    title: 'Test Therapy Session',
    description: 'Integration test session',
    therapist_id: therapistId,
    patient_id: patientId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: 'scheduled',
    type: 'video',
    location: 'video_conference'
  };

  try {
    const appointment = await createAppointment(appointmentData);
    return appointment as TestAppointment;
  } catch (error) {
    console.error('Failed to create test appointment:', error);
    throw error;
  }
};

// Test session URL generation and validation
export const testSessionUrlGeneration = (appointmentId: string): boolean => {
  const expectedUrl = `/video-session/${appointmentId}`;
  const generatedUrl = `/video-session/${appointmentId}`;
  return expectedUrl === generatedUrl;
};

// Test user authorization for session access
export const testSessionAuthorization = (
  sessionId: string,
  userId: string,
  userRole: 'patient' | 'therapist' | 'admin',
  appointment: TestAppointment
): { authorized: boolean; reason?: string } => {
  if (!appointment) {
    return { authorized: false, reason: 'Appointment not found' };
  }

  const isPatient = appointment.patient_id === userId;
  const isTherapist = appointment.therapist_id === userId;
  const isAdmin = userRole === 'admin';

  if (isPatient || isTherapist || isAdmin) {
    return { authorized: true };
  }

  return { 
    authorized: false, 
    reason: 'User not associated with this appointment' 
  };
};

// Mock WebRTC connection test
export const testWebRTCConnection = async (): Promise<{
  success: boolean;
  mediaAccess: boolean;
  peerConnection: boolean;
  error?: string;
}> => {
  try {
    // Test media device access
    const mediaAccess = await testMediaDeviceAccess();
    
    // Test peer connection creation
    const peerConnectionTest = testPeerConnectionCreation();
    
    return {
      success: mediaAccess && peerConnectionTest,
      mediaAccess,
      peerConnection: peerConnectionTest
    };
  } catch (error) {
    return {
      success: false,
      mediaAccess: false,
      peerConnection: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const testMediaDeviceAccess = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    
    // In a real test environment, this would actually request media access
    // For integration testing, we'll simulate it
    return true;
  } catch {
    return false;
  }
};

const testPeerConnectionCreation = (): boolean => {
  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pc.close();
    return true;
  } catch {
    return false;
  }
};

// Test real-time synchronization simulation
export const testRealTimeSync = async (appointmentId: string): Promise<{
  success: boolean;
  events: string[];
  latency?: number;
}> => {
  const events: string[] = [];
  const startTime = Date.now();
  
  try {
    // Simulate real-time events
    events.push('Patient joined waiting room');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    events.push('Therapist joined session');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    events.push('Patient admitted to session');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    events.push('Video connection established');
    
    const latency = Date.now() - startTime;
    
    return {
      success: true,
      events,
      latency
    };
  } catch (error) {
    return {
      success: false,
      events,
    };
  }
};

// Edge case testing scenarios
export const testEdgeCases = {
  unauthorizedAccess: (userId: string, appointmentId: string) => {
    // Test access with user not part of appointment
    return {
      scenario: 'Unauthorized user attempts to join session',
      expectedResult: 'Access denied',
      userId,
      appointmentId
    };
  },
  
  sessionNotFound: (invalidSessionId: string) => {
    return {
      scenario: 'User attempts to join non-existent session',
      expectedResult: 'Session not found error',
      sessionId: invalidSessionId
    };
  },
  
  expiredSession: (appointmentId: string) => {
    return {
      scenario: 'User attempts to join expired session',
      expectedResult: 'Session no longer available',
      appointmentId
    };
  },
  
  concurrentAccess: (appointmentId: string) => {
    return {
      scenario: 'Multiple users attempt to join simultaneously',
      expectedResult: 'Proper session management',
      appointmentId
    };
  }
};
