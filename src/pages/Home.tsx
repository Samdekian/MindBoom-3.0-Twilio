
import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleBasedDashboard } from "@/utils/routing/unified-route-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoadingState } from "@/components/ui/loading-state";

const Home = () => {
  const { user, primaryRole, isInitialized, loading } = useAuthRBAC();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || loading) return;

    // If user is authenticated, redirect to appropriate dashboard
    if (user && primaryRole) {
      const redirectPath = getRoleBasedDashboard(primaryRole);
      navigate(redirectPath, { replace: true });
    }
  }, [user, primaryRole, isInitialized, loading, navigate]);

  // Show loading while auth is initializing
  if (!isInitialized || loading) {
    return (
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text="Loading..." 
        fullscreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to MindCare
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional therapy services at your fingertips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>For Patients</CardTitle>
              <CardDescription>
                Connect with licensed therapists and start your journey to better mental health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Book appointments with qualified therapists</li>
                <li>Secure video sessions</li>
                <li>Track your progress</li>
                <li>AI-powered mood tracking</li>
              </ul>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Therapists</CardTitle>
              <CardDescription>
                Join our platform and help patients on their mental health journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Manage patient appointments</li>
                <li>Secure communication tools</li>
                <li>Treatment planning features</li>
                <li>Progress tracking dashboard</li>
              </ul>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link to="/therapist-register">Apply as Therapist</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
