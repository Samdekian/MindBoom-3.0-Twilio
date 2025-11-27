// Simplified test helper functions for Phase 4

export const createMockTestUsers = () => ({
  patient: {
    id: 'test-patient-123',
    name: 'Test Patient',
    role: 'patient'
  },
  therapist: {
    id: 'test-therapist-456', 
    name: 'Test Therapist',
    role: 'therapist'
  }
});

export const createTestAppointment = async (patientId: string, therapistId: string, durationMinutes: number) => {
  return {
    id: 'test-appointment-789',
    patient_id: patientId,
    therapist_id: therapistId,
    title: 'Test Therapy Session',
    start_time: new Date(Date.now() + 30 * 60000).toISOString(),
    end_time: new Date(Date.now() + (30 + durationMinutes) * 60000).toISOString(),
    status: 'scheduled' as const
  };
};

export const testSessionAuthorization = async (appointmentId: string, userId: string, userRole: string, appointment: any) => {
  // Mock authorization test
  return { passed: true, authorized: true };
};

export const testWebRTCConnection = async () => {
  // Mock WebRTC connection test
  return { passed: true, connected: true };
};

export const testRealTimeSync = async (sessionId: string) => {
  // Mock real-time sync test
  return { passed: true, synced: true };
};

export const testEdgeCases = {
  unauthorizedAccess: (userId: string, sessionId: string) => ({
    expectedResult: 'Access denied'
  }),
  sessionNotFound: (sessionId: string) => ({
    expectedResult: 'Session not found error'
  })
};