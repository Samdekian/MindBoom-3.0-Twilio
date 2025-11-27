
import React from "react";
import { Helmet } from "react-helmet-async";
import EnhancedNavbar from "@/components/navbar/EnhancedNavbar";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AppLayout = ({ children, title, description }: AppLayoutProps) => {
  // Enable real-time notifications
  useRealTimeNotifications();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title ? `${title} | Therapy Platform` : 'Therapy Platform'}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      
      <EnhancedNavbar />
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
