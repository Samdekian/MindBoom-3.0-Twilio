
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientInquiriesPage from "@/pages/PatientInquiriesPage";
import PatientTreatmentPlansPage from "@/pages/PatientTreatmentPlansPage";
import PatientHistoryPage from "@/pages/PatientHistoryPage";
import PatientResourcesPage from "@/pages/PatientResourcesPage";
import { EnhancedTherapistDirectory } from "@/components/booking/EnhancedTherapistDirectory";

// Placeholder components for patient pages
const PatientBookSession = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">Book a Session</h1>
    <EnhancedTherapistDirectory />
  </div>
);

const PatientRoutes = () => {
  const { isPatient, isAdmin, loading } = useAuthRBAC();

  // Show loading while checking roles
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect non-patient users
  if (!isPatient && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      {/* Patient dashboard - matches /patient */}
      <Route path="/" element={<PatientDashboard />} />
      
      {/* Book session page */}
      <Route path="/book" element={<PatientBookSession />} />
      
      {/* Patient inquiries page */}
      <Route path="/inquiries" element={<PatientInquiriesPage />} />
      
      {/* Treatment plans page */}
      <Route path="/treatment-plans" element={<PatientTreatmentPlansPage />} />
      
      {/* Session history page */}
      <Route path="/history" element={<PatientHistoryPage />} />
      
      {/* Resources page */}
      <Route path="/resources" element={<PatientResourcesPage />} />
    </Routes>
  );
};

export default PatientRoutes;
