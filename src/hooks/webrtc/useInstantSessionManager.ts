import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface InstantSession {
  id: string;
  session_name: string;
  session_token: string;
  therapist_id: string;
  max_participants: number;
  waiting_room_enabled: boolean;
  recording_enabled: boolean;
  is_active: boolean;
  session_status: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export const useInstantSessionManager = () => {
  const [currentSession, setCurrentSession] = useState<InstantSession | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const sessionCleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a new instant session
  const createInstantSession = useCallback(async (sessionName: string = 'Instant Session') => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a session',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('🚀 Creating instant session...');

      // Generate a unique session token
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Session expires in 4 hours
      const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('instant_sessions')
        .insert({
          session_name: sessionName,
          session_token: sessionToken,
          therapist_id: user.id,
          max_participants: 10, // Allow up to 10 participants
          waiting_room_enabled: true,
          recording_enabled: false,
          is_active: true,
          session_status: 'created',
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Instant session created:', data);
      setCurrentSession(data);

      toast({
        title: 'Session Created',
        description: 'Your instant session is ready to share',
      });

      return data;
    } catch (error) {
      console.error('❌ Error creating instant session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create instant session',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Get session by token (for joining)
  const getSessionByToken = useCallback(async (sessionToken: string) => {
    if (!sessionToken || sessionToken.trim() === '') return null;

    try {
      console.log('🔍 Looking up session by token:', sessionToken);

      const { data, error } = await supabase
        .from('instant_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Session not found or expired');
          return null;
        }
        throw error;
      }

      console.log('✅ Session found:', data);
      return data;
    } catch (error) {
      console.error('❌ Error looking up session:', error);
      return null;
    }
  }, []);

  // Get session by ID
  const getSessionById = useCallback(async (sessionId: string) => {
    if (!sessionId || sessionId.trim() === '') return null;

    try {
      console.log('🔍 Looking up session by ID:', sessionId);

      const { data, error } = await supabase
        .from('instant_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Session not found');
          return null;
        }
        throw error;
      }

      console.log('✅ Session found:', data);
      setCurrentSession(data);
      return data;
    } catch (error) {
      console.error('❌ Error looking up session:', error);
      return null;
    }
  }, []);

  // Update session status
  const updateSessionStatus = useCallback(async (sessionId: string, status: string) => {
    try {
      console.log(`🔄 Updating session ${sessionId} status to:`, status);

      const { error } = await supabase
        .from('instant_sessions')
        .update({ 
          session_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      console.log('✅ Session status updated');
      
      // Update local state if this is the current session
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(prev => prev ? { 
          ...prev, 
          session_status: status,
          updated_at: new Date().toISOString()
        } : null);
      }
    } catch (error) {
      console.error('❌ Error updating session status:', error);
    }
  }, [currentSession]);

  // End session
  const endSession = useCallback(async (sessionId: string) => {
    try {
      console.log('🔚 Ending session:', sessionId);

      const { error } = await supabase
        .from('instant_sessions')
        .update({ 
          is_active: false,
          session_status: 'ended',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Also cleanup any remaining participants
      await supabase
        .from('instant_session_participants')
        .update({ 
          is_active: false, 
          left_at: new Date().toISOString() 
        })
        .eq('session_id', sessionId)
        .eq('is_active', true);

      console.log('✅ Session ended and participants cleaned up');
      
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null);
      }

      toast({
        title: 'Session Ended',
        description: 'The session has been ended successfully',
      });
    } catch (error) {
      console.error('❌ Error ending session:', error);
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  }, [currentSession, toast]);

  // Extend session expiration
  const extendSession = useCallback(async (sessionId: string, hours: number = 2) => {
    try {
      console.log(`⏰ Extending session ${sessionId} by ${hours} hours`);

      const newExpirationTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('instant_sessions')
        .update({ 
          expires_at: newExpirationTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      console.log('✅ Session extended');
      
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(prev => prev ? { 
          ...prev, 
          expires_at: newExpirationTime,
          updated_at: new Date().toISOString()
        } : null);
      }

      toast({
        title: 'Session Extended',
        description: `Session extended by ${hours} hours`,
      });
    } catch (error) {
      console.error('❌ Error extending session:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend session',
        variant: 'destructive',
      });
    }
  }, [currentSession, toast]);

  // Auto-cleanup expired sessions
  useEffect(() => {
    const cleanupExpiredSessions = async () => {
      try {
        console.log('🧹 Cleaning up expired sessions...');
        
        await supabase.rpc('cleanup_expired_instant_sessions');
        
        console.log('✅ Expired sessions cleaned up');
      } catch (error) {
        console.error('❌ Error cleaning up expired sessions:', error);
      }
    };

    // Run cleanup every 5 minutes
    sessionCleanupTimeoutRef.current = setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

    // Run initial cleanup
    cleanupExpiredSessions();

    return () => {
      if (sessionCleanupTimeoutRef.current) {
        clearInterval(sessionCleanupTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentSession,
    loading,
    createInstantSession,
    getSessionByToken,
    getSessionById,
    updateSessionStatus,
    endSession,
    extendSession,
  };
};