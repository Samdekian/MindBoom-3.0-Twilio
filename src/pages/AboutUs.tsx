
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Users, Shield, Award } from "lucide-react";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Our Platform</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting patients with licensed therapists through secure, accessible, and personalized mental healthcare solutions.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We believe that mental healthcare should be accessible, affordable, and tailored to each individual's needs. 
              Our platform bridges the gap between patients seeking support and qualified therapists ready to help, 
              using technology to make mental wellness more attainable for everyone.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Personalized Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Every patient receives tailored treatment plans and matched with therapists who specialize in their specific needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All sessions and data are encrypted and HIPAA-compliant, ensuring your privacy and confidentiality at all times.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Licensed Professionals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All our therapists are licensed, verified professionals with extensive experience in their specializations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of patients who have found support and healing through our platform.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutUs;
