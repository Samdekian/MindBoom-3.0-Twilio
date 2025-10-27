
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, AlertTriangle, Users, FileText } from "lucide-react";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-blue-500" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using our therapy platform, you agree to be bound by these Terms of Service and our Privacy Policy. 
              If you disagree with any part of these terms, you may not access our service.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-500" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Our platform provides access to licensed mental health professionals through secure video conferencing, 
              messaging, and other digital tools. Services include:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Individual therapy sessions with licensed therapists</li>
              <li>• Therapist matching based on your needs and preferences</li>
              <li>• Secure communication tools</li>
              <li>• Progress tracking and session notes</li>
              <li>• Mental health resources and tools</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-500" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Account Security</h4>
              <p className="text-gray-700">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Accurate Information</h4>
              <p className="text-gray-700">You must provide accurate, current, and complete information during registration and keep your information updated.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Appropriate Use</h4>
              <p className="text-gray-700">You agree to use our platform only for lawful purposes and in accordance with professional therapeutic relationships.</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Important Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-red-600">Emergency Situations</h4>
              <p className="text-gray-700">
                This platform is NOT intended for emergency mental health situations. If you are experiencing a mental health emergency, 
                please contact emergency services (911) or go to your nearest emergency room immediately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Not a Substitute for In-Person Care</h4>
              <p className="text-gray-700">
                While our platform provides professional mental health services, it may not be suitable for all conditions. 
                Your therapist may recommend in-person care when appropriate.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Technical Requirements</h4>
              <p className="text-gray-700">
                You are responsible for ensuring you have the necessary technology and internet connection to access our services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-gray-700">
              <li>• Payment is due at the time of service or according to your subscription plan</li>
              <li>• Cancellations must be made at least 24 hours in advance to avoid charges</li>
              <li>• Refunds are provided according to our refund policy</li>
              <li>• Subscription plans automatically renew unless cancelled</li>
              <li>• We reserve the right to modify pricing with 30 days notice</li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy and Confidentiality */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Privacy and Confidentiality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We maintain strict confidentiality in accordance with HIPAA regulations and professional ethical standards. 
              However, therapists are required by law to report certain situations including threats of harm to self or others, 
              child abuse, or elder abuse.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Our platform and services are provided "as is" without warranties of any kind. We are not liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email 
              or platform notification. Continued use of our services constitutes acceptance of modified terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-1 text-gray-700">
              <p>Email: legal@therapyplatform.com</p>
              <p>Phone: 1-800-THERAPY</p>
              <p>Address: 123 Healthcare Ave, Legal Dept, LC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
