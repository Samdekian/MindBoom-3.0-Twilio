
import RoleBasedGuard from "../RoleBasedGuard";
import RolePassthroughRoute from "../RolePassthroughRoute";
import RoleBasedContainer from "../RoleBasedContainer";
import RoleBasedNavItem from "../RoleBasedNavItem";
import RoleBasedNavLink from "../RoleBasedNavLink";
import RoleBasedField from "../RoleBasedField";
import PermissionField from "../PermissionField";

// Export all components with consistent naming
export {
  RoleBasedGuard,
  RolePassthroughRoute,  // Export with its original name
  RoleBasedContainer,
  RoleBasedNavItem,
  RoleBasedNavLink,
  RoleBasedField,
  PermissionField,
};

// Provide a named export for backward compatibility if needed
export { RolePassthroughRoute as RoleProtectedRoute };
