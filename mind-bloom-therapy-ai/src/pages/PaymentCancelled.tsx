
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment process was cancelled. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
