// Security utilities for video sessions
export interface SecurityConfig {
  requireAuth: boolean;
  encryptionLevel: 'basic' | 'enhanced' | 'enterprise';
  allowRecording: boolean;
  allowScreenShare: boolean;
  participantLimit: number;
  sessionTimeout: number; // in minutes
}

export interface SessionAccessControl {
  userId: string;
  role: 'therapist' | 'patient' | 'observer';
  permissions: SessionPermission[];
  expiresAt: Date;
}

export type SessionPermission = 
  | 'video' 
  | 'audio' 
  | 'chat' 
  | 'screen_share' 
  | 'recording' 
  | 'notes' 
  | 'admin';

export class SessionSecurityManager {
  private config: SecurityConfig;
  private accessControls: Map<string, SessionAccessControl> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  validateAccess(userId: string, permission: SessionPermission): boolean {
    const access = this.accessControls.get(userId);
    
    if (!access) {
      return false;
    }

    if (access.expiresAt < new Date()) {
      this.revokeAccess(userId);
      return false;
    }

    return access.permissions.includes(permission);
  }

  grantAccess(userId: string, role: SessionAccessControl['role'], customPermissions?: SessionPermission[]) {
    const permissions = customPermissions || this.getDefaultPermissions(role);
    const expiresAt = new Date(Date.now() + this.config.sessionTimeout * 60 * 1000);

    this.accessControls.set(userId, {
      userId,
      role,
      permissions,
      expiresAt
    });
  }

  revokeAccess(userId: string) {
    this.accessControls.delete(userId);
  }

  private getDefaultPermissions(role: SessionAccessControl['role']): SessionPermission[] {
    switch (role) {
      case 'therapist':
        return ['video', 'audio', 'chat', 'screen_share', 'recording', 'notes', 'admin'];
      case 'patient':
        return ['video', 'audio', 'chat'];
      case 'observer':
        return ['chat'];
      default:
        return [];
    }
  }

  validateSessionIntegrity(sessionData: any): boolean {
    // Validate session data integrity
    if (!sessionData.id || !sessionData.createdAt) {
      return false;
    }

    // Check if session has expired
    const maxAge = this.config.sessionTimeout * 60 * 1000;
    const sessionAge = Date.now() - new Date(sessionData.createdAt).getTime();
    
    return sessionAge < maxAge;
  }

  generateSecureToken(): string {
    // Generate a secure session token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  sanitizeInput(input: string): string {
    // Basic input sanitization
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .trim()
      .slice(0, 1000); // Limit length
  }
}