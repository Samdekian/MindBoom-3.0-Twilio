
import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRole } from '@/utils/rbac/types';

interface RoleSyncStatusIndicatorProps {
  roles: UserRole[];
  hasMismatch?: boolean;
  className?: string;
  showText?: boolean;
}

const RoleSyncStatusIndicator: React.FC<RoleSyncStatusIndicatorProps> = ({
  roles,
  hasMismatch = false,
  className,
  showText = false
}) => {
  // Display state based on status
  if (hasMismatch) {
    return (
      <Badge variant="outline" className={cn("text-amber-500 border-amber-500", className)}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        {showText && <span>Sync needed</span>}
      </Badge>
    );
  } else if (roles.length === 0) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        <Shield className="h-3 w-3 mr-1" />
        {showText && <span>No roles</span>}
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className={cn("text-green-500 border-green-500", className)}>
        <CheckCircle className="h-3 w-3 mr-1" />
        {showText && <span>Synced</span>}
      </Badge>
    );
  }
};

export default RoleSyncStatusIndicator;
