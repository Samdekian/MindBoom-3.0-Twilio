
import React from "react";
import { useParams } from "react-router-dom";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import SessionDetails from "@/components/session/SessionDetails";
import { AuthGuard } from "@/components/auth/AuthGuard";

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthRBAC();

  if (!sessionId) {
    return <div>Session not found</div>;
  }

  return (
    <AuthGuard>
      <SessionDetails sessionId={sessionId} />
    </AuthGuard>
  );
};

export default SessionPage;
