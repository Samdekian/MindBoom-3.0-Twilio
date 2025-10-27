
import React from "react";
import StripePaymentProcessor from "@/components/payment/StripePaymentProcessor";

const PaymentDemo: React.FC = () => {
  // In a real application, these price IDs would come from your Stripe dashboard
  // For testing, you can use Stripe's test price IDs or create your own in test mode
  const demoPaymentOptions = [
    {
      id: "basic-plan",
      name: "Basic Plan",
      description: "Essential features for individuals",
      price: 49.99,
      priceId: "price_1OqyakEuofFtrO7pR5sdP4YK", // Replace with your actual Stripe price ID
      mode: "payment" as const,
    },
    {
      id: "premium-plan",
      name: "Premium Plan",
      description: "Advanced features for professionals",
      price: 99.99,
      priceId: "price_1OqyakEuofFtrO7pR5sdP4YK", // Replace with your actual Stripe price ID
      mode: "payment" as const,
    },
  ];

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">MindBloom Payment</h1>
        <StripePaymentProcessor 
          paymentOptions={demoPaymentOptions} 
          title="Choose Your Plan"
          description="Select the plan that works best for your needs"
        />
        <div className="mt-8 p-4 bg-muted rounded-md">
          <h3 className="text-lg font-medium mb-2">Testing Information</h3>
          <p className="text-muted-foreground mb-2">
            Use the following test card information for Stripe testing:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Card Number: 4242 4242 4242 4242</li>
            <li>Expiration: Any future date</li>
            <li>CVC: Any 3 digits</li>
            <li>ZIP: Any 5 digits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;
