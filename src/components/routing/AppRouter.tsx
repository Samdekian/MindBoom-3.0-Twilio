
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { LoadingState } from '@/components/ui/loading-state';
import { IconErrorBoundary } from '@/components/ui/icon-error-boundary';
import RouteValidator from './RouteValidator';

// Pages
import Index from '@/pages/Index';
import SecureAuth from '@/pages/SecureAuth';
import Profile from '@/pages/Profile';
import SessionPage from '@/pages/SessionPage';
import InstantSessionJoin from '@/pages/InstantSessionJoin';
import VideoConferencePage from '@/pages/VideoConferencePage';
import MobileOptimizationDemo from '@/pages/MobileOptimizationDemo';

// Route Components
import SmartDashboard from '@/components/routing/SmartDashboard';
import PatientRoutes from '@/routes/PatientRoutes';
import TherapistRoutes from '@/routes/TherapistRoutes';
import AdminRoutes from '@/routes/AdminRoutes';
import AuthRoute from '@/routes/AuthRoute';
import GuestRoute from '@/routes/GuestRoute';

const AppRouter: React.FC = () => {
  const { isAuthenticated, loading, isInitialized } = useAuthRBAC();

  console.log('[AppRouter] Current state:', {
    isAuthenticated,
    loading,
    isInitialized
  });

  if (!isInitialized || loading) {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text="Loading application..." 
        fullscreen={true}
      />
    );
  }

  return (
    <IconErrorBoundary>
      <Routes>
        {/* Root Route */}
        <Route path="/" element={<Index />} />
        
        {/* Public Routes - Protected against authenticated users */}
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <SecureAuth />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <SecureAuth />
            </GuestRoute>
          } 
        />
        <Route 
          path="/auth" 
          element={
            <GuestRoute>
              <SecureAuth />
            </GuestRoute>
          } 
        />
        
        {/* Smart Dashboard Route - Handles role-based redirection */}
        <Route 
          path="/dashboard" 
          element={
            <AuthRoute>
              <SmartDashboard />
            </AuthRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <AuthRoute>
              <Profile />
            </AuthRoute>
          } 
        />
        
        {/* Role-based Dashboard Routes */}
        <Route 
          path="/admin/*" 
          element={
            <AuthRoute>
              <AdminRoutes />
            </AuthRoute>
          } 
        />
        
        <Route 
          path="/therapist/*" 
          element={
            <AuthRoute>
              <TherapistRoutes />
            </AuthRoute>
          } 
        />
        
        <Route 
          path="/patient/*" 
          element={
            <AuthRoute>
              <PatientRoutes />
            </AuthRoute>
          } 
        />
        
        {/* Session Routes */}
        <Route 
          path="/session/:appointmentId" 
          element={
            <AuthRoute>
              <SessionPage />
            </AuthRoute>
          } 
        />
        <Route 
          path="/video/:appointmentId" 
          element={
            <AuthRoute>
              <SessionPage />
            </AuthRoute>
          } 
        />
        <Route 
          path="/video-conference/:sessionId" 
          element={
            <AuthRoute>
              <VideoConferencePage />
            </AuthRoute>
          } 
        />
        <Route 
          path="/session/instant/:token" 
          element={
            <AuthRoute>
              <InstantSessionJoin />
            </AuthRoute>
          } 
        />
        
        {/* Mobile Optimization Demo */}
        <Route 
          path="/mobile-optimization" 
          element={<MobileOptimizationDemo />} 
        />
        
        {/* Catch-all: redirect to login for unknown routes */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />}
        />
      </Routes>
      
      {/* Route Validator - Only shows in development */}
      <RouteValidator />
    </IconErrorBoundary>
  );
};

export default AppRouter;
