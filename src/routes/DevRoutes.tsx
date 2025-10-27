
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Development pages
import DevComponents from "@/pages/dev/DevComponents";
import RBACTestingPage from "@/pages/dev/RBACTestingPage";
import MobileTestingPage from "@/pages/dev/MobileTestingPage";

const DevRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dev/components"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DevComponents />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dev/rbac-testing"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RBACTestingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dev/mobile-testing"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MobileTestingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default DevRoutes;
