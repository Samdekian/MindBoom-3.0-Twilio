
import React from "react";
import { Helmet } from "react-helmet-async";
import ResponsiveDemo from "@/components/mobile-testing/ResponsiveDemo";

const MobileTestingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Mobile Testing | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mobile Testing</h1>
          <p className="text-muted-foreground">
            Test mobile responsiveness and functionality
          </p>
        </div>
        
        <ResponsiveDemo />
      </div>
    </div>
  );
};

export default MobileTestingPage;
