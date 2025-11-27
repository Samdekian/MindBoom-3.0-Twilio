
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const TherapistRegister = () => {
  const { user } = useAuthRBAC();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register as Therapist</CardTitle>
          <CardDescription className="text-center">
            Create your professional account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Therapist registration form will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistRegister;
