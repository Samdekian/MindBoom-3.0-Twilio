
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import AdminDashboard from "@/pages/AdminDashboard";

const AdminRoutes = () => {
  const { isAdmin, loading } = useAuthRBAC();

  // Show loading while checking roles
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect non-admin users directly to patient dashboard to avoid circular redirects
  if (!isAdmin) {
    console.log('[AdminRoutes] Non-admin user, redirecting to patient dashboard');
    return <Navigate to="/patient" replace />;
  }

  return (
    <Routes>
      {/* Admin dashboard - matches /admin */}
      <Route path="/" element={<AdminDashboard />} />
      
      {/* Additional admin routes can be added here as needed */}
    </Routes>
  );
};

export default AdminRoutes;
