
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@/types/core/rbac";
import UserRoleBadge from "./UserRoleBadge";

interface UserSummaryProps {
  userId: string;
  fullName?: string;
  email?: string;
  roles?: UserRole[];
  size?: "sm" | "md" | "lg";
  showRoles?: boolean;
  className?: string;
}

/**
 * A component to display a summary of a user, including their avatar, name, and roles
 */
export const UserSummary: React.FC<UserSummaryProps> = ({
  userId,
  fullName = "Unknown User",
  email,
  roles = [],
  size = "md",
  showRoles = true,
  className = ""
}) => {
  // Get user initials for the avatar fallback
  const getInitials = () => {
    if (!fullName || fullName === "Unknown User") {
      return "U";
    }
    
    return fullName
      .split(" ")
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };
  
  // Determine avatar size
  const getAvatarSize = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-12 w-12";
      case "md":
      default:
        return "h-10 w-10";
    }
  };
  
  // Determine text size
  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      case "md":
      default:
        return "text-base";
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <Avatar className={getAvatarSize()}>
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="ml-3">
        <div className={`font-medium ${getTextSize()}`}>{fullName}</div>
        {email && (
          <div className="text-gray-500 dark:text-gray-400 text-sm">{email}</div>
        )}
        
        {showRoles && roles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {roles.map((role) => (
              <UserRoleBadge
                key={role}
                role={role}
                size={size === "lg" ? "md" : "sm"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSummary;
