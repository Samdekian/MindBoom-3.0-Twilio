
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Users, 
  Settings, 
  Calendar,
  MessageCircle,
  Shield
} from 'lucide-react';
import { isDevelopmentMode } from '@/config/development';

export const DevNavigation: React.FC = () => {
  if (!isDevelopmentMode()) {
    return null;
  }

  const devRoutes = [
    { path: '/login', label: 'Login Page', icon: User },
    { path: '/register', label: 'Patient Register', icon: User },
    { path: '/therapist-register', label: 'Therapist Register', icon: Users },
    { path: '/patient', label: 'Patient Dashboard', icon: User },
    { path: '/therapist', label: 'Therapist Dashboard', icon: Users },
    { path: '/admin', label: 'Admin Dashboard', icon: Shield },
    { path: '/profile', label: 'Profile Page', icon: Settings },
  ];

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Development Navigation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {devRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <Button
                key={route.path}
                variant="outline"
                size="sm"
                asChild
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <Link to={route.path}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{route.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-orange-700 mt-3">
          🚧 Development Mode: All routes are accessible without authentication
        </p>
      </CardContent>
    </Card>
  );
};

export default DevNavigation;
