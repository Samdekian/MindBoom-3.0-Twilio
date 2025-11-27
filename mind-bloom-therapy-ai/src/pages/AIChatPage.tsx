
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AIChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
          <p className="text-gray-600">Get support between therapy sessions</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mental Health AI Assistant</CardTitle>
            <CardDescription>
              24/7 support and guidance for your mental health journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              AI chat assistant coming soon. This will provide you with immediate 
              support and coping strategies between your therapy sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChatPage;
