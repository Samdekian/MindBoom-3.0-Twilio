import { nanoid } from 'nanoid';

export interface MockParticipant {
  id: string;
  name: string;
  role: 'therapist' | 'patient' | 'participant';
  videoEnabled: boolean;
  audioEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  isActiveSpeaker?: boolean;
  isCurrentUser?: boolean;
}

export interface MockSession {
  id: string;
  title: string;
  participants: MockParticipant[];
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'ended';
  type: 'individual' | 'group';
}

export interface MockStreamData {
  participantId: string;
  streamId: string;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  quality: 'high' | 'medium' | 'low';
  bandwidth: number;
}

// Generate mock participants for testing
export const generateMockParticipants = (count: number): MockParticipant[] => {
  const participants: MockParticipant[] = [];
  
  for (let i = 0; i < count; i++) {
    const isTherapist = i === 0;
    const participant: MockParticipant = {
      id: nanoid(),
      name: isTherapist ? 'Dr. Smith' : `Patient ${i}`,
      role: isTherapist ? 'therapist' : 'patient',
      videoEnabled: Math.random() > 0.2, // 80% chance of video enabled
      audioEnabled: Math.random() > 0.1, // 90% chance of audio enabled
      connectionQuality: getRandomConnectionQuality(),
      isActiveSpeaker: i === 0, // First participant is active speaker
      isCurrentUser: i === 0, // First participant is current user
    };
    
    participants.push(participant);
  }
  
  return participants;
};

// Generate mock session data
export const generateMockSession = (
  participantCount: number = 3,
  sessionType: 'individual' | 'group' = 'group'
): MockSession => {
  const sessionId = nanoid();
  const participants = generateMockParticipants(participantCount);
  
  const now = new Date();
  const startTime = new Date(now.getTime() - 10 * 60000); // 10 minutes ago
  const endTime = new Date(now.getTime() + 50 * 60000); // 50 minutes from now
  
  return {
    id: sessionId,
    title: `${sessionType === 'group' ? 'Group' : 'Individual'} Therapy Session`,
    participants,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'active',
    type: sessionType,
  };
};

// Generate mock stream data
export const generateMockStreamData = (participants: MockParticipant[]): MockStreamData[] => {
  return participants.map(participant => ({
    participantId: participant.id,
    streamId: `stream-${participant.id}`,
    quality: getQualityFromConnection(participant.connectionQuality),
    bandwidth: getBandwidthForQuality(getQualityFromConnection(participant.connectionQuality)),
  }));
};

// Generate test scenarios for different session sizes
export const generateTestScenarios = () => {
  return [
    {
      name: 'Individual Session',
      participantCount: 2,
      type: 'individual' as const,
      expectedLayout: 'side-by-side',
    },
    {
      name: 'Small Group',
      participantCount: 4,
      type: 'group' as const,
      expectedLayout: '2x2-grid',
    },
    {
      name: 'Medium Group',
      participantCount: 8,
      type: 'group' as const,
      expectedLayout: 'speaker-view',
    },
    {
      name: 'Large Group',
      participantCount: 15,
      type: 'group' as const,
      expectedLayout: 'paginated-grid',
    },
    {
      name: 'Max Capacity',
      participantCount: 20,
      type: 'group' as const,
      expectedLayout: 'speaker-view-with-overflow',
    },
  ];
};

// Generate performance test data
export const generatePerformanceTestData = () => {
  return {
    bandwidthScenarios: [
      { bandwidth: 100, expectedQuality: 'low', participants: 2 },
      { bandwidth: 300, expectedQuality: 'medium', participants: 4 },
      { bandwidth: 500, expectedQuality: 'medium', participants: 6 },
      { bandwidth: 1000, expectedQuality: 'high', participants: 8 },
      { bandwidth: 2000, expectedQuality: 'high', participants: 12 },
    ],
    
    loadTestScenarios: [
      { participants: 3, duration: 1000, expectedFPS: 30 },
      { participants: 6, duration: 2000, expectedFPS: 25 },
      { participants: 10, duration: 3000, expectedFPS: 20 },
      { participants: 15, duration: 5000, expectedFPS: 15 },
    ],
    
    networkConditions: [
      { name: 'Excellent', latency: 20, jitter: 5, packetLoss: 0 },
      { name: 'Good', latency: 50, jitter: 10, packetLoss: 0.1 },
      { name: 'Fair', latency: 100, jitter: 20, packetLoss: 0.5 },
      { name: 'Poor', latency: 200, jitter: 50, packetLoss: 1.0 },
    ],
  };
};

// Generate mock analytics data
export const generateMockAnalyticsData = (sessionId: string) => {
  const now = Date.now();
  const duration = 30 * 60 * 1000; // 30 minutes
  const dataPoints = 30; // One data point per minute
  
  const metrics = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - duration + (i * (duration / dataPoints));
    
    metrics.push({
      timestamp,
      participantCount: Math.floor(Math.random() * 5) + 2, // 2-6 participants
      averageBandwidth: Math.floor(Math.random() * 1000) + 200, // 200-1200 kbps
      averageLatency: Math.floor(Math.random() * 100) + 20, // 20-120 ms
      packetLoss: Math.random() * 2, // 0-2% packet loss
      frameRate: Math.floor(Math.random() * 15) + 15, // 15-30 FPS
      audioQuality: Math.random() * 5, // 0-5 quality score
      videoQuality: Math.random() * 5, // 0-5 quality score
    });
  }
  
  return {
    sessionId,
    startTime: now - duration,
    endTime: now,
    metrics,
    summary: {
      totalDuration: duration,
      averageParticipants: 3.5,
      peakParticipants: 6,
      connectionStability: 0.95, // 95% stability
      overallQuality: 4.2, // Out of 5
    },
  };
};

// Helper functions
function getRandomConnectionQuality(): 'excellent' | 'good' | 'poor' | 'disconnected' {
  const rand = Math.random();
  if (rand < 0.6) return 'excellent';
  if (rand < 0.8) return 'good';
  if (rand < 0.95) return 'poor';
  return 'disconnected';
}

function getQualityFromConnection(
  connection: 'excellent' | 'good' | 'poor' | 'disconnected'
): 'high' | 'medium' | 'low' {
  switch (connection) {
    case 'excellent': return 'high';
    case 'good': return 'medium';
    case 'poor': return 'low';
    case 'disconnected': return 'low';
  }
}

function getBandwidthForQuality(quality: 'high' | 'medium' | 'low'): number {
  switch (quality) {
    case 'high': return Math.floor(Math.random() * 500) + 800; // 800-1300 kbps
    case 'medium': return Math.floor(Math.random() * 300) + 300; // 300-600 kbps
    case 'low': return Math.floor(Math.random() * 200) + 100; // 100-300 kbps
  }
}

// Export all generators as a convenience object
export const TestDataGenerators = {
  participants: generateMockParticipants,
  session: generateMockSession,
  streams: generateMockStreamData,
  scenarios: generateTestScenarios,
  performance: generatePerformanceTestData,
  analytics: generateMockAnalyticsData,
};