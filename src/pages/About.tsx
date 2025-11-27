
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center">About MindCare</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              MindCare is a comprehensive mental health platform connecting patients with licensed therapists 
              through secure, convenient online sessions.
            </p>
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600 mb-6">
              To make quality mental health care accessible to everyone, anywhere, at any time.
            </p>
            <h3 className="text-xl font-semibold mb-4">Features</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Secure video therapy sessions</li>
              <li>Licensed and verified therapists</li>
              <li>Flexible scheduling</li>
              <li>Progress tracking and mood monitoring</li>
              <li>HIPAA-compliant platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
