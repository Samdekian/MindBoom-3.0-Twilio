
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const TherapistRegistrationConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Registration Successful!</CardTitle>
          <CardDescription className="text-center">
            Your therapist account has been created and is awaiting approval.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p>Thank you for registering as a therapist on our platform.</p>
            <p>Our admin team will review your application and approve your account shortly.</p>
            <p className="font-medium">You'll receive an email notification once your account is approved.</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full" 
            onClick={() => navigate("/")}
          >
            Return to Home Page
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TherapistRegistrationConfirmation;
