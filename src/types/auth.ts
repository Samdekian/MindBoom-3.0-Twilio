
import { Session, User } from "@supabase/supabase-js";
import { UserRole } from "@/utils/rbac/types";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRoles: UserRole[];
  permissions: string[];
  signIn?: (email: string, password: string) => Promise<{ error?: any }>;
  signUp?: (email: string, password: string, metadata?: any) => Promise<{ error?: any; data?: any }>;
  signOut?: () => Promise<void>;
  resetPassword?: (email: string) => Promise<{ error?: any }>;
  updatePassword?: (password: string) => Promise<{ error?: any }>;
  checkTherapistApproval?: () => Promise<any>;
}
