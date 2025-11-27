
import React from "react";
import { Loader2 } from "lucide-react";

export const SessionLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};

export default SessionLoading;
