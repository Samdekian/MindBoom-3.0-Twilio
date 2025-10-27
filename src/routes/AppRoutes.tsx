
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import SecureAuth from '@/pages/SecureAuth';
import NotFound from '@/pages/NotFound';
import AuthRoute from '@/routes/AuthRoute';
import TherapistRoutes from '@/routes/TherapistRoutes';
import PatientRoutes from '@/routes/PatientRoutes';
import AdminRoutes from '@/routes/AdminRoutes';
import VideoConferencePage from '@/pages/VideoConferencePage';
import InstantSessionJoin from '@/pages/InstantSessionJoin';
import SessionPage from '@/pages/SessionPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<SecureAuth />} />
      <Route path="/register" element={<SecureAuth />} />
      <Route path="/auth" element={<SecureAuth />} />
      
      {/* Video conference routes */}
      <Route path="/video-conference/:sessionId" element={<VideoConferencePage />} />
      <Route path="/session/instant/:token" element={<InstantSessionJoin />} />
      <Route path="/session/:sessionId" element={<SessionPage />} />
      
      {/* Protected routes by role - using nested routes */}
      <Route path="/therapist/*" element={
        <AuthRoute>
          <TherapistRoutes />
        </AuthRoute>
      } />
      
      <Route path="/patient/*" element={
        <AuthRoute>
          <PatientRoutes />
        </AuthRoute>
      } />
      
      <Route path="/admin/*" element={
        <AuthRoute>
          <AdminRoutes />
        </AuthRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
