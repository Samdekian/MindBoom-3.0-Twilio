
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Stethoscope, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: 'admin' | 'therapist' | 'patient';
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  },
  therapist: {
    label: 'Therapist',
    icon: Stethoscope,
    color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  },
  patient: {
    label: 'Patient',
    icon: User,
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  variant = 'default',
  className 
}) => {
  const config = roleConfig[role];
  const IconComponent = config.icon;

  if (variant === 'icon-only') {
    return (
      <div className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-full",
        config.color,
        className
      )}>
        <IconComponent className="h-3 w-3" />
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.color,
        variant === 'compact' && 'px-2 py-0.5',
        className
      )}
    >
      <IconComponent className="h-3 w-3" />
      {variant !== 'compact' && <span>{config.label}</span>}
    </Badge>
  );
};
