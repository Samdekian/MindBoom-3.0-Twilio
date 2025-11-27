
import React from "react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/core/rbac";
import { getRoleDisplayName } from "@/utils/rbac/role-type-helpers";

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * A simple badge component that displays a user role with appropriate styling
 */
export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  className = "",
  size = "md"
}) => {
  // Determine variant based on role
  const getVariant = () => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case 'therapist':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case 'patient':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'support':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    }
  };
  
  // Determine size classes
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-0.5";
      case "lg":
        return "text-sm px-3 py-1.5";
      case "md":
      default:
        return "text-xs px-2.5 py-1";
    }
  };
  
  return (
    <Badge
      className={`font-medium rounded-full ${getVariant()} ${getSizeClass()} ${className}`}
      variant="outline"
    >
      {getRoleDisplayName(role)}
    </Badge>
  );
};

export default UserRoleBadge;
