
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { PROVIDER_DEPENDENCIES } from '@/types/core/providers';

interface ProviderDependencyNavLinkProps {
  to: string;
  label: string;
  providers: string[];
}

export function ProviderDependencyNavLink({ to, label, providers }: ProviderDependencyNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center justify-between p-2 rounded-md ${
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`
      }
    >
      <span>{label}</span>
      <div className="flex gap-1">
        {providers.map(provider => {
          const dependencies = PROVIDER_DEPENDENCIES[provider] || [];
          const hasDependencies = dependencies.length > 0;
          
          return (
            <Badge 
              key={provider} 
              variant={hasDependencies ? "default" : "outline"}
              className="text-xs"
            >
              {provider.replace('Provider', '')}
              {hasDependencies && <span className="ml-1 text-xs">({dependencies.length})</span>}
            </Badge>
          );
        })}
      </div>
    </NavLink>
  );
}
