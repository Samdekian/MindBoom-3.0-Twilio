
import React from "react";
import { OAuthDetails } from "./OAuthDetails";

interface OAuthStatusProps {
  isConnected: boolean;
  onConnect: () => void;
  lastTokenRefresh?: string | null;
  userUri?: string | null;
}

export const OAuthStatus = ({ 
  isConnected, 
  onConnect,
  lastTokenRefresh,
  userUri 
}: OAuthStatusProps) => {
  return (
    <OAuthDetails
      isConnected={isConnected}
      onConnect={onConnect}
      lastTokenRefresh={lastTokenRefresh}
      userUri={userUri}
    />
  );
};
