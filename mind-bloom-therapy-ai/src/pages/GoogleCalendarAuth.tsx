
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

/**
 * This page handles the OAuth redirect from Google Calendar.
 * It's a minimal component that just shows a loading state
 * while the OAuth callback is processed by the GoogleCalendarIntegration
 * component's useEffect hook.
 */
const GoogleCalendarAuth = () => {
  useEffect(() => {
    // Set a timeout to redirect if the callback takes too long
    const timeoutId = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <Helmet>
        <title>Connecting Google Calendar | MindBloom</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Connecting to Google Calendar</h1>
          <p className="text-muted-foreground">
            Please wait while we complete the connection...
          </p>
        </div>
      </div>
    </>
  );
};

export default GoogleCalendarAuth;
