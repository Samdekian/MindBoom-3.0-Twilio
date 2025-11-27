
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import TherapistDashboard from "@/pages/TherapistDashboard";
import TherapistPatientsPage from "@/pages/TherapistPatientsPage";

const TherapistRoutes = () => {
  const { isTherapist, isAdmin, loading } = useAuthRBAC();

  // Show loading while checking roles
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect non-therapist users directly to patient dashboard to avoid circular redirects
  if (!isTherapist && !isAdmin) {
    console.log('[TherapistRoutes] Non-therapist user, redirecting to patient dashboard');
    return <Navigate to="/patient" replace />;
  }

  return (
    <Routes>
      {/* Therapist dashboard - matches /therapist */}
      <Route path="/" element={<TherapistDashboard />} />
      
      {/* Therapist patients page - matches /therapist/patients */}
      <Route path="/patients" element={<TherapistPatientsPage />} />
      
      {/* Additional therapist routes can be added here as needed */}
    </Routes>
  );
};

export default TherapistRoutes;
