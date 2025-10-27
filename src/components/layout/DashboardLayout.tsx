
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import EnhancedNavbar from '@/components/navbar/EnhancedNavbar';
import BaseLayout from './BaseLayout';
import { cn } from '@/lib/utils';
import { useMigrationTracking } from '@/utils/migration/migration-helpers';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  showNavbar = false,
  className
}) => {
  // Track migration
  useMigrationTracking('DashboardLayout', 'useAuthRBAC');

  if (sidebar) {
    return (
      <BaseLayout variant="dashboard" className={className}>
        <SidebarProvider>
          {showNavbar && <EnhancedNavbar />}
          {sidebar}
          <div className="main-content">
            {children}
          </div>
        </SidebarProvider>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout variant="dashboard" className={className}>
      {showNavbar && <EnhancedNavbar />}
      <div className="main-content">
        {children}
      </div>
    </BaseLayout>
  );
};

export default DashboardLayout;
