
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import PatientRegistrationForm from "@/components/register/PatientRegistrationForm";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useToast } from "@/hooks/use-toast";

/**
 * PatientRegister Component
 * 
 * Dedicated registration page for patients to create their accounts.
 * After successful registration, patients are redirected to the login page.
 * This component handles the complete registration flow for patient users only.
 */
const PatientRegister: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthOperations();
  const { toast } = useToast();

  const handlePatientRegister = async (email: string, password: string, name: string) => {
    setIsSubmitting(true);
    try {
      await signUp(email, password, name, "patient");
      toast({
        title: "Registration Successful",
        description: "Your patient account has been created. You can now log in.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create a patient account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our therapy platform to connect with professionals
          </p>
        </div>
        
        <PatientRegistrationForm 
          onSubmit={handlePatientRegister}
          isSubmitting={isSubmitting}
        />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-therapy-purple hover:text-therapy-deep-purple">
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PatientRegister;
