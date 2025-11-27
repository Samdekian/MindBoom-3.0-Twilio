import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionPersistenceManager } from '@/lib/webrtc/session-persistence';

// Mock supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({ error: null })),
    upsert: vi.fn(() => ({ error: null })),
    delete: vi.fn(() => ({ error: null })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('SessionPersistenceManager', () => {
  let sessionPersistence: SessionPersistenceManager;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionPersistence = SessionPersistenceManager.getInstance();
  });

  it('should initialize session successfully', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    
    const session = sessionPersistence.getCurrentSession();
    expect(session).toBeTruthy();
    expect(session?.sessionId).toBe('test-session');
    expect(session?.userId).toBe('test-user');
    expect(session?.status).toBe('active');
  });

  it('should add participant to session', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.addParticipant('other-user');
    
    const session = sessionPersistence.getCurrentSession();
    expect(session?.participants).toContain('test-user');
    expect(session?.participants).toContain('other-user');
  });

  it('should remove participant from session', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.addParticipant('other-user');
    await sessionPersistence.removeParticipant('other-user');
    
    const session = sessionPersistence.getCurrentSession();
    expect(session?.participants).toContain('test-user');
    expect(session?.participants).not.toContain('other-user');
  });

  it('should update connection state', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.updateConnectionState('other-user', 'connected', 'connected');
    
    const session = sessionPersistence.getCurrentSession();
    expect(session?.connectionStates['other-user']).toBe('connected');
    expect(session?.iceStates['other-user']).toBe('connected');
  });

  it('should update quality', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    
    const quality = { overall: 'good', details: { latency: 50 } };
    await sessionPersistence.updateQuality(quality);
    
    const session = sessionPersistence.getCurrentSession();
    expect(session?.quality).toEqual(quality);
  });

  it('should pause and resume session', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    
    await sessionPersistence.pauseSession();
    expect(sessionPersistence.getCurrentSession()?.status).toBe('paused');
    
    await sessionPersistence.resumeSession();
    expect(sessionPersistence.getCurrentSession()?.status).toBe('active');
  });

  it('should end session', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.endSession();
    
    expect(sessionPersistence.getCurrentSession()).toBeNull();
  });

  it('should record disconnection', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.recordDisconnection('network_error');
    
    const recoveryData = sessionPersistence.getRecoveryData();
    expect(recoveryData).toBeTruthy();
    expect(recoveryData?.reconnectionCount).toBe(0);
  });

  it('should handle pending signaling messages', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.recordDisconnection();
    
    const offerData = { type: 'offer', sdp: 'test-sdp' };
    await sessionPersistence.addPendingSignaling('offer', offerData);
    
    const pending = await sessionPersistence.getPendingSignaling();
    expect(pending?.offers).toHaveLength(1);
    expect(pending?.offers[0].data).toEqual(offerData);
  });

  it('should clear pending signaling messages', async () => {
    await sessionPersistence.initializeSession('test-session', 'test-user');
    await sessionPersistence.recordDisconnection();
    
    await sessionPersistence.addPendingSignaling('offer', { type: 'offer' });
    await sessionPersistence.clearPendingSignaling();
    
    const pending = await sessionPersistence.getPendingSignaling();
    expect(pending?.offers).toHaveLength(0);
  });

  it('should handle database constraint violation with retry', async () => {
    // Mock constraint violation error with complete supabase chain
    const mockFrom = vi.fn(() => ({
      upsert: vi.fn(() => ({ error: null })),
      delete: vi.fn(() => ({ error: null })),
      insert: vi.fn()
        .mockResolvedValueOnce({ error: { code: '23505' } }) // First call fails
        .mockResolvedValueOnce({ error: null }), // Second call succeeds
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
        }))
      }))
    }));

    mockSupabase.from.mockImplementation(mockFrom);

    await sessionPersistence.initializeSession('test-session', 'test-user');
    
    // Should retry and eventually succeed
    expect(mockFrom().insert).toHaveBeenCalledTimes(2);
  });

  it('should be singleton instance', () => {
    const instance1 = SessionPersistenceManager.getInstance();
    const instance2 = SessionPersistenceManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });
});