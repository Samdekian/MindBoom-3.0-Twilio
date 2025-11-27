
// Import unified route config for consistency
export { ROUTE_PATHS as UNIFIED_ROUTES } from '@/utils/routing/unified-route-config';

export const PROTECTED_PATHS = {
  DASHBOARD: "/dashboard",
  PROFILE: "/profile", 
  APPOINTMENTS: "/appointments",
  CALENDAR: "/calendar",
  SESSION: (id: string) => `/session/${id}`,
  VIDEO_CONFERENCE: (id: string) => `/video-conference/${id}`,
  VIDEO_SESSION: (id: string) => `/video-session/${id}`,
  SECURITY_SETTINGS: "/security-settings",
  
  // Role-specific dashboard paths
  PATIENT_DASHBOARD: "/patient",
  THERAPIST_DASHBOARD: "/therapist", 
  ADMIN_DASHBOARD: "/admin",
  
  // Patient-specific routes
  PATIENT_BOOK: "/patient/book",
  PATIENT_TREATMENT_PLANS: "/patient/treatment-plans",
  PATIENT_HISTORY: "/patient/history",
  PATIENT_INQUIRIES: "/patient/inquiries",
  
  // Legacy patient routes (for backwards compatibility)
  BOOK_THERAPIST: "/book-therapist",
  TREATMENT_PLANS: "/treatment-plans",
  SESSION_HISTORY: "/session-history",
  AI_CHAT: "/ai-chat",
  MOOD_TRACKER: "/mood-tracker",
  
  // Therapist-specific routes
  THERAPIST_PATIENTS: "/therapist/patients",
  THERAPIST_TREATMENT_PLANS: "/therapist/treatment-plans",
  THERAPIST_AVAILABILITY: "/therapist/availability",
  THERAPIST_ANALYTICS: "/therapist/analytics",
  THERAPIST_INQUIRIES: "/therapist/inquiries",
  
  // Shared routes
  MESSAGES: "/messages",
} as const;

export const PUBLIC_PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRICING: "/pricing",
  PRIVACY: "/privacy",
  TERMS: "/terms",
} as const;

export const AUTH_PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  THERAPIST_REGISTER: "/therapist-register",
  THERAPIST_CONFIRMATION: "/therapist-registration-confirmation",
} as const;

export const ADMIN_PATHS = {
  DASHBOARD: "/admin",
  USERS: "/admin/users",
  RBAC: "/admin/rbac",
  ROLE_MANAGEMENT: "/admin/role-management",
  SECURITY_DASHBOARD: "/admin/security-dashboard",
  RBAC_MONITORING: "/admin/rbac-monitoring",
  FEATURE_FLAGS: "/admin/feature-flags",
  THERAPIST_APPROVAL: "/admin/therapist-approval",
  REPORTS: "/admin/reports",
  SYSTEM: "/admin/system",
} as const;

export const DEV_PATHS = {
  COMPONENTS: "/dev/components",
  RBAC_TESTING: "/dev/rbac-testing",
  MOBILE_TESTING: "/dev/mobile-testing",
} as const;

// Session navigation helpers
export const SESSION_PATHS = {
  VIDEO_SESSION: (appointmentId: string) => `/video-session/${appointmentId}`,
} as const;

// Use unified routing for these values
export const DEFAULT_GUEST_REDIRECT = "/login";
export const DEFAULT_AUTH_REDIRECT = "/dashboard";

// Legacy route exports for compatibility
export const ROUTES = {
  ...PUBLIC_PATHS,
  ...PROTECTED_PATHS,
  ...ADMIN_PATHS,
  ...AUTH_PATHS,
  ...DEV_PATHS,
  ...SESSION_PATHS,
} as const;
