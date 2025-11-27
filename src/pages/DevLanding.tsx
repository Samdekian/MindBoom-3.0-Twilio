
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DevNavigation } from '@/components/dev/DevNavigation';
import { 
  Stethoscope, 
  User, 
  Users, 
  Shield,
  Code,
  Rocket
} from 'lucide-react';

const DevLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Stethoscope className="h-10 w-10 text-blue-600" />
            Therapy Platform
            <Code className="h-8 w-8 text-orange-600" />
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Development Environment
          </p>
          <p className="text-sm text-orange-600">
            🚧 All authentication and role restrictions are bypassed
          </p>
        </div>

        <DevNavigation />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Patient Experience
              </CardTitle>
              <CardDescription>
                Test patient registration, dashboard, and booking features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/register">Register as Patient</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/patient">Patient Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Therapist Experience
              </CardTitle>
              <CardDescription>
                Test therapist registration, approval, and dashboard features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/therapist-register">Register as Therapist</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/therapist">Therapist Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Admin Experience
              </CardTitle>
              <CardDescription>
                Test admin dashboard and therapist approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/profile">Profile Management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Use the navigation above to access any page directly</li>
              <li>No login required - all authentication is bypassed</li>
              <li>Test patient registration and dashboard features</li>
              <li>Test therapist registration and approval workflow</li>
              <li>Use admin dashboard to approve therapists</li>
              <li>All role restrictions are disabled in development mode</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevLanding;
