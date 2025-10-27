
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600">Choose the plan that works best for you</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <div className="text-3xl font-bold">$80<span className="text-lg font-normal">/session</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />45-minute sessions</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Licensed therapists</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Secure video calls</li>
              </ul>
              <Button className="w-full mt-6">Get Started</Button>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <div className="text-3xl font-bold">$120<span className="text-lg font-normal">/session</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />60-minute sessions</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Specialized therapists</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Progress tracking</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />24/7 support</li>
              </ul>
              <Button className="w-full mt-6">Get Started</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="text-3xl font-bold">Custom</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Custom solutions</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Team management</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />API access</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Dedicated support</li>
              </ul>
              <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
