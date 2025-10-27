export interface AuthContextType {
  user: import('@supabase/supabase-js').User | null;
  session: import('@supabase/supabase-js').Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ data: any; error?: Error }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error?: Error }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: Error }>;
  updatePassword: (newPassword: string) => Promise<{ error?: Error }>;
  register?: (email: string, password: string, metadata?: any) => Promise<{ data: any; error?: Error }>;
  logout?: () => Promise<void>;
  
  // Keeping this as any[] instead of string[] for compatibility with AuthRBACContextType
  permissions: any[];
}
