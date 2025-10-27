
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  mode: "payment" | "subscription";
}

interface StripePaymentProcessorProps {
  paymentOptions: PaymentOption[];
  title?: string;
  description?: string;
}

const StripePaymentProcessor: React.FC<StripePaymentProcessorProps> = ({
  paymentOptions,
  title = "Complete Your Payment",
  description = "Select a payment option to proceed",
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(
    paymentOptions[0] || null
  );
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!selectedOption) {
      toast({
        title: "No payment option selected",
        description: "Please select a payment option to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: selectedOption.priceId,
          mode: selectedOption.mode,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-md cursor-pointer transition-all ${
                selectedOption?.id === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div className="text-lg font-semibold">
                  ${option.price.toFixed(2)}
                  {option.mode === "subscription" && <span className="text-sm text-muted-foreground">/mo</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePayment} 
          disabled={loading || !selectedOption}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${selectedOption?.price.toFixed(2) || "0.00"}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StripePaymentProcessor;
