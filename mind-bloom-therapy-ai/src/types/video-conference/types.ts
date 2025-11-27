
import { ConnectionQuality } from "../core/rbac";

// Video state types
export interface VideoState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  connectionQuality: ConnectionQuality;
  isChatOpen: boolean;
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  screenShareEnabled?: boolean;
  recordingEnabled?: boolean;
  videoQuality?: 'high' | 'medium' | 'low' | 'auto';
}

export type VideoBlurLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Video effects interface
export interface VideoEffects {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
  virtualBackgroundEnabled: boolean;
  virtualBackgroundUrl: string | null;
  filterEnabled: boolean;
  filterType: string | null;
}

// Video devices interface
export interface VideoDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  hasCameras?: boolean;
  hasMicrophones?: boolean;
  hasSpeakers?: boolean;
  loading?: boolean;
  error?: Error | null;
  defaultDevices?: {
    camera: string | null;
    microphone: string | null;
    speaker: string | null;
  };
  allDevices?: MediaDeviceInfo[];
}

// Patient data types
export interface PatientData {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  insuranceInfo?: string;
  therapistId?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'archived' | 'pending';
  notes?: string;
  treatment?: TreatmentPlan;
  avatar?: string;
  lastSessionDate?: string;
  nextSessionDate?: string;
  upcomingSessionDate?: string;
  progress?: 'improving' | 'stable' | 'declining' | 'variable';
  moodTrend: 'improving' | 'stable' | 'declining' | 'unknown' | 'variable';
  activeTreatmentPlan: boolean;
}

export interface TreatmentPlan {
  id: string;
  title: string;
  patientId: string;
  startDate: string;
  endDate?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  goals: TreatmentGoal[];
  notes?: string;
  status: 'active' | 'completed' | 'draft' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentGoal {
  id: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'canceled' | 'cancelled';
  targetDate?: string;
  completedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  milestones?: string[];
  title?: string;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
}

// Chat panel props
export interface ChatPanelProps {
  messages: Array<{
    id?: string;
    userId: string;
    text: string;
    timestamp: string | number | Date;
    fileUrl?: string;
    fileName?: string;
  }>;
  isLoading: boolean;
  onSendMessage: (text: string, fileUrl?: string, fileName?: string) => void;
  uploadFile?: (file: File) => Promise<string | null>;
  currentUserId: string;
  onClose?: () => void;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
}
