import { Permission, PermissionLevel, CustomRole, PermissionGroup, PermissionPreset } from "@/types/permissions";
import { supabase } from "@/integrations/supabase/client";

// Permission inheritance logic
const permissionLevels: PermissionLevel[] = ['none', 'read', 'write', 'admin'];

// Get the effective permission level based on inheritance
export const getEffectivePermissionLevel = (
  permission: string,
  role: CustomRole,
  allPermissionGroups: PermissionGroup[]
): PermissionLevel => {
  // Direct permission assignment takes precedence
  if (role.permissions && role.permissions[permission]) {
    return role.permissions[permission];
  }

  // Check permission groups
  let highestLevel: PermissionLevel = 'none';
  
  // Find all permission groups that contain this permission
  role.permissionGroups.forEach(groupId => {
    const group = allPermissionGroups.find(g => g.id === groupId);
    if (group && group.permissions.includes(permission)) {
      // For now we assume all permissions in a group have the same level
      // This could be enhanced to have per-permission levels in groups
      const groupLevel = role.permissions[`group:${groupId}`] || 'none';
      
      // Keep the highest permission level
      if (permissionLevels.indexOf(groupLevel) > permissionLevels.indexOf(highestLevel)) {
        highestLevel = groupLevel;
      }
    }
  });

  return highestLevel;
};

// Check if a permission level is sufficient for a required level
export const hasPermissionLevel = (
  userLevel: PermissionLevel, 
  requiredLevel: PermissionLevel
): boolean => {
  return permissionLevels.indexOf(userLevel) >= permissionLevels.indexOf(requiredLevel);
};

// Default system roles with predefined permissions
export const systemRoles: CustomRole[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
    permissionGroups: ["system", "user", "content", "settings"],
    permissions: {
      // Group permissions
      "group:system": "admin",
      "group:user": "admin",
      "group:content": "admin",
      "group:settings": "admin",
      
      // Individual permission overrides
      "system.view_logs": "admin",
      "system.manage_roles": "admin",
      "user.manage_accounts": "admin",
      "content.publish": "admin",
      "settings.manage_system": "admin"
    },
    isSystemRole: true
  },
  {
    id: "therapist",
    name: "Therapist",
    description: "Therapist role with patient management",
    permissionGroups: ["user", "content", "calendar"],
    permissions: {
      "group:user": "read",
      "group:content": "write",
      "group:calendar": "write",
      
      // Individual permission overrides
      "user.view_patients": "read",
      "user.edit_own_profile": "write",
      "content.create_notes": "write",
      "calendar.manage_appointments": "write"
    },
    isSystemRole: true
  },
  {
    id: "patient",
    name: "Patient",
    description: "Patient with limited system access",
    permissionGroups: ["content", "calendar"],
    permissions: {
      "group:content": "read",
      "group:calendar": "read",
      
      // Individual permission overrides
      "content.view_own": "read",
      "calendar.view_appointments": "read",
      "user.edit_own_profile": "write"
    },
    isSystemRole: true
  },
  {
    id: "support",
    name: "Support Staff",
    description: "Customer support with limited admin access",
    permissionGroups: ["user", "content"],
    permissions: {
      "group:user": "read",
      "group:content": "read",
      
      // Individual permission overrides
      "user.view_accounts": "read",
      "content.view_all": "read",
      "system.view_logs": "read"
    },
    isSystemRole: true
  }
];

// Default permission groups
export const defaultPermissionGroups: PermissionGroup[] = [
  {
    id: "system",
    name: "System Administration",
    permissions: [
      "system.view_logs",
      "system.manage_roles",
      "system.manage_permissions",
      "system.view_metrics",
      "system.manage_api_keys"
    ]
  },
  {
    id: "user",
    name: "User Management",
    permissions: [
      "user.view_accounts",
      "user.create_accounts",
      "user.edit_accounts", 
      "user.delete_accounts",
      "user.manage_accounts",
      "user.edit_own_profile",
      "user.view_patients"
    ]
  },
  {
    id: "content",
    name: "Content Management",
    permissions: [
      "content.view_own",
      "content.view_all",
      "content.create",
      "content.edit", 
      "content.delete",
      "content.publish",
      "content.create_notes"
    ]
  },
  {
    id: "settings",
    name: "System Settings",
    permissions: [
      "settings.view",
      "settings.edit",
      "settings.manage_system",
      "settings.manage_integrations",
      "settings.manage_security"
    ]
  },
  {
    id: "calendar",
    name: "Calendar Management",
    permissions: [
      "calendar.view_appointments",
      "calendar.create_appointments",
      "calendar.edit_appointments",
      "calendar.delete_appointments",
      "calendar.manage_appointments"
    ]
  }
];

// Default permissions
export const defaultPermissions: Permission[] = [
  // System permissions
  { id: "system.view_logs", name: "View System Logs", description: "View system event logs", category: "System" },
  { id: "system.manage_roles", name: "Manage Roles", description: "Create, edit, and delete user roles", category: "System" },
  { id: "system.manage_permissions", name: "Manage Permissions", description: "Create and edit permission settings", category: "System" },
  { id: "system.view_metrics", name: "View System Metrics", description: "View system performance metrics", category: "System" },
  { id: "system.manage_api_keys", name: "Manage API Keys", description: "Create, view, and revoke API keys", category: "System" },
  
  // User permissions
  { id: "user.view_accounts", name: "View User Accounts", description: "View user account information", category: "User Management" },
  { id: "user.create_accounts", name: "Create User Accounts", description: "Create new user accounts", category: "User Management" },
  { id: "user.edit_accounts", name: "Edit User Accounts", description: "Edit existing user accounts", category: "User Management" },
  { id: "user.delete_accounts", name: "Delete User Accounts", description: "Delete user accounts", category: "User Management" },
  { id: "user.manage_accounts", name: "Manage User Accounts", description: "Full management of user accounts", category: "User Management" },
  { id: "user.edit_own_profile", name: "Edit Own Profile", description: "Edit your own user profile", category: "User Management" },
  { id: "user.view_patients", name: "View Patients", description: "View patient information", category: "User Management" },
  
  // Content permissions
  { id: "content.view_own", name: "View Own Content", description: "View content you created", category: "Content Management" },
  { id: "content.view_all", name: "View All Content", description: "View all system content", category: "Content Management" },
  { id: "content.create", name: "Create Content", description: "Create new content", category: "Content Management" },
  { id: "content.edit", name: "Edit Content", description: "Edit existing content", category: "Content Management" },
  { id: "content.delete", name: "Delete Content", description: "Delete content", category: "Content Management" },
  { id: "content.publish", name: "Publish Content", description: "Publish content live to users", category: "Content Management" },
  { id: "content.create_notes", name: "Create Notes", description: "Create and manage session notes", category: "Content Management" },
  
  // Settings permissions
  { id: "settings.view", name: "View Settings", description: "View system settings", category: "Settings" },
  { id: "settings.edit", name: "Edit Settings", description: "Edit system settings", category: "Settings" },
  { id: "settings.manage_system", name: "Manage System", description: "Manage core system settings", category: "Settings" },
  { id: "settings.manage_integrations", name: "Manage Integrations", description: "Manage third-party integrations", category: "Settings" },
  { id: "settings.manage_security", name: "Manage Security", description: "Manage security settings", category: "Settings" },
  
  // Calendar permissions
  { id: "calendar.view_appointments", name: "View Appointments", description: "View calendar appointments", category: "Calendar" },
  { id: "calendar.create_appointments", name: "Create Appointments", description: "Create new appointments", category: "Calendar" },
  { id: "calendar.edit_appointments", name: "Edit Appointments", description: "Edit existing appointments", category: "Calendar" },
  { id: "calendar.delete_appointments", name: "Delete Appointments", description: "Cancel or delete appointments", category: "Calendar" },
  { id: "calendar.manage_appointments", name: "Manage Appointments", description: "Full management of appointments", category: "Calendar" },
];

// Permission presets
export const permissionPresets: PermissionPreset[] = [
  {
    id: "minimal_access",
    name: "Minimal Access",
    description: "View-only access to basic platform features",
    permissions: {
      "user.edit_own_profile": "write",
      "content.view_own": "read",
      "calendar.view_appointments": "read"
    }
  },
  {
    id: "content_creator",
    name: "Content Creator",
    description: "Create and manage content, no admin access",
    permissions: {
      "user.edit_own_profile": "write",
      "content.view_own": "read",
      "content.view_all": "read",
      "content.create": "write",
      "content.edit": "write",
      "content.delete": "write"
    }
  },
  {
    id: "therapist_preset",
    name: "Therapist Access",
    description: "Standard permissions for therapists",
    permissions: {
      "user.edit_own_profile": "write",
      "user.view_patients": "read",
      "content.view_own": "read",
      "content.view_all": "read",
      "content.create": "write",
      "content.edit": "write",
      "content.create_notes": "write",
      "calendar.view_appointments": "read",
      "calendar.create_appointments": "write",
      "calendar.edit_appointments": "write",
      "calendar.manage_appointments": "write"
    }
  },
  {
    id: "support_agent",
    name: "Support Agent",
    description: "Customer support permissions",
    permissions: {
      "user.view_accounts": "read",
      "user.edit_own_profile": "write",
      "content.view_all": "read",
      "system.view_logs": "read",
      "calendar.view_appointments": "read"
    }
  }
];

// Save a custom role - using local storage instead of database since custom_roles table doesn't exist
export const saveCustomRole = async (role: CustomRole): Promise<CustomRole> => {
  try {
    // For now, we'll store in localStorage since we don't have a database table
    const storedRoles = localStorage.getItem('customRoles');
    let existingRoles: CustomRole[] = storedRoles ? JSON.parse(storedRoles) : [];
    
    // Check if we're updating an existing role
    const roleIndex = existingRoles.findIndex(r => r.id === role.id);
    
    if (roleIndex >= 0) {
      // Update existing role
      existingRoles[roleIndex] = {
        ...role,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Create new role with a generated ID if needed
      const newRole = {
        ...role,
        id: role.id || `custom-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      existingRoles.push(newRole);
    }
    
    // Save back to storage
    localStorage.setItem('customRoles', JSON.stringify(existingRoles));
    
    // Return the role with any added fields
    return role.id 
      ? role 
      : { ...role, id: `custom-${Date.now()}`, createdAt: new Date().toISOString() };
  } catch (error) {
    console.error("Error saving custom role:", error);
    throw error;
  }
};

// Get all custom roles
export const getCustomRoles = async (): Promise<CustomRole[]> => {
  try {
    // Get from local storage
    const storedRoles = localStorage.getItem('customRoles');
    const customRoles = storedRoles ? JSON.parse(storedRoles) : [];
    
    // Combine with system roles
    return [...systemRoles, ...customRoles];
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    throw error;
  }
};
