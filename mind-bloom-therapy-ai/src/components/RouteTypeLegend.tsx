
import React from 'react';
import { cn } from '@/lib/utils';

interface RouteTypeItem {
  type: string;
  label: string;
  color: string;
  description: string;
}

interface RouteTypeLegendProps {
  className?: string;
  compact?: boolean;
}

const RouteTypeLegend: React.FC<RouteTypeLegendProps> = ({ 
  className, 
  compact = false 
}) => {
  const routeTypes: RouteTypeItem[] = [
    {
      type: 'public',
      label: 'Public Routes',
      color: 'bg-blue-500',
      description: 'Accessible to all users'
    },
    {
      type: 'auth',
      label: 'Auth Routes',
      color: 'bg-gray-500',
      description: 'Login, registration, password reset'
    },
    {
      type: 'protected',
      label: 'Protected Routes',
      color: 'bg-purple-500',
      description: 'Requires user authentication'
    },
    {
      type: 'admin',
      label: 'Admin Routes',
      color: 'bg-orange-500',
      description: 'Requires admin privileges'
    },
  ];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        {routeTypes.map((route) => (
          <div key={route.type} className="flex items-center gap-2">
            <span className={cn("w-3 h-3 rounded-full", route.color)}></span>
            <span>{route.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="bg-muted/50 px-4 py-2 border-b">
        <h3 className="font-medium">Route Type Legend</h3>
      </div>
      <ul className="divide-y">
        {routeTypes.map((route) => (
          <li key={route.type} className="px-4 py-2 flex items-center gap-3">
            <span className={cn("w-4 h-4 rounded-full", route.color)}></span>
            <div>
              <div className="font-medium">{route.label}</div>
              <div className="text-sm text-muted-foreground">{route.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RouteTypeLegend;
