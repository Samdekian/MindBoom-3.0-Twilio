
import React from "react";
import { Shield, ShieldPlus, ShieldX, Edit3 } from "lucide-react";
import { RoleActionType } from "@/types/core/rbac";

interface EventIconProps {
  actionType: RoleActionType;
  className?: string;
}

export const EventIcon: React.FC<EventIconProps> = ({ actionType, className }) => {
  switch (actionType) {
    case "assigned":
      return <ShieldPlus className={className} />;
    case "removed":
      return <ShieldX className={className} />;
    case "edited":
      return <Edit3 className={className} />;
    default:
      return <Shield className={className} />;
  }
};
