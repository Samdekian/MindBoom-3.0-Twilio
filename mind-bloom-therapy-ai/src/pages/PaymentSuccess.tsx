
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthRBAC();
  
  const sessionId = searchParams.get('session_id');
  const appointmentId = searchParams.get('appointment_id');

  const handleViewAppointments = () => {
    navigate('/appointments');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your appointment has been booked successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>What's next?</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Your therapist will contact you before the session</li>
              <li>• Join the video call 5 minutes before your appointment</li>
            </ul>
          </div>

          {appointmentId && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Appointment ID: <span className="font-mono">{appointmentId}</span>
              </p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleViewAppointments} 
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View My Appointments
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="w-full"
            >
              Back to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
