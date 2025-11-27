
import React from 'react';
import { Badge } from '@/components/ui/badge';

export interface RolePriorityProps {
  role: string;
}

export const RolePriority: React.FC<RolePriorityProps> = ({ role }) => {
  const getPriorityColor = () => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100';
      case 'therapist':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100';
      case 'patient':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100';
      case 'support':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <Badge variant="outline" className={`text-xs font-normal ${getPriorityColor()}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};
