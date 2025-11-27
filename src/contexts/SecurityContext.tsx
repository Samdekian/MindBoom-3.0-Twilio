
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { supabase } from '@/integrations/supabase/client';

export type SecurityLevel = 'standard' | 'enhanced' | 'hipaa';

interface SecurityEvent {
  event_type: string;
  details: Record<string, any>;
  timestamp: string;
}

interface SecurityContextType {
  securityLevel: SecurityLevel;
  updateSecurityLevel: (level: SecurityLevel) => Promise<void>;
  logSecurityEvent: (eventType: string, details: Record<string, any>) => Promise<void>;
  getSecurityEvents: () => Promise<SecurityEvent[]>;
  isSecurityCompliant: (requiredLevel: SecurityLevel) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuthRBAC();
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('standard');

  useEffect(() => {
    if (user) {
      // Load user's security level from database or set default
      loadSecurityLevel();
    }
  }, [user]);

  const loadSecurityLevel = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('security_level')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading security level:', error);
        return;
      }
      
      if (data?.security_level) {
        setSecurityLevel(data.security_level as SecurityLevel);
      }
    } catch (error) {
      console.error('Error loading security level:', error);
    }
  };

  const updateSecurityLevel = async (level: SecurityLevel) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ security_level: level })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setSecurityLevel(level);
    } catch (error) {
      console.error('Error updating security level:', error);
      throw error;
    }
  };

  const logSecurityEvent = async (eventType: string, details: Record<string, any>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user.id,
          event_type: eventType,
          details,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  };

  const getSecurityEvents = async (): Promise<SecurityEvent[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('event_type, details, timestamp')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  };

  const isSecurityCompliant = (requiredLevel: SecurityLevel): boolean => {
    const levels = { standard: 1, enhanced: 2, hipaa: 3 };
    return levels[securityLevel] >= levels[requiredLevel];
  };

  const value: SecurityContextType = {
    securityLevel,
    updateSecurityLevel,
    logSecurityEvent,
    getSecurityEvents,
    isSecurityCompliant,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
