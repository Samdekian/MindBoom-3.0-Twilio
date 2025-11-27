
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              Our Commitment to Your Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              At our therapy platform, we understand that your privacy is paramount, especially when it comes to mental health information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-500" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <p className="text-gray-700">Name, email address, phone number, date of birth, and billing information when you create an account or make a payment.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Health Information</h4>
              <p className="text-gray-700">Mental health assessments, therapy session notes, treatment goals, and progress reports as necessary for your care.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Usage Data</h4>
              <p className="text-gray-700">Information about how you interact with our platform, including session times, features used, and technical information.</p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-purple-500" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li>• Provide and improve our therapy services</li>
              <li>• Match you with appropriate licensed therapists</li>
              <li>• Process payments and manage your account</li>
              <li>• Communicate with you about your sessions and account</li>
              <li>• Ensure platform security and prevent fraud</li>
              <li>• Comply with legal obligations and healthcare regulations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-red-500" />
              Data Security & HIPAA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• End-to-end encryption for all therapy sessions</li>
              <li>• HIPAA-compliant data storage and transmission</li>
              <li>• Regular security audits and vulnerability assessments</li>
              <li>• Limited access controls for authorized personnel only</li>
              <li>• Secure data centers with 24/7 monitoring</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• With your explicit consent</li>
              <li>• To your assigned therapist for treatment purposes</li>
              <li>• When required by law or to protect safety</li>
              <li>• To trusted service providers who assist in platform operations (under strict confidentiality agreements)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Access and review your personal information</li>
              <li>• Request corrections to inaccurate data</li>
              <li>• Request deletion of your account and data</li>
              <li>• Opt-out of non-essential communications</li>
              <li>• File a complaint with healthcare privacy authorities</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact our Privacy Officer at:
            </p>
            <div className="mt-4 space-y-1 text-gray-700">
              <p>Email: privacy@therapyplatform.com</p>
              <p>Phone: 1-800-THERAPY</p>
              <p>Address: 123 Healthcare Ave, Privacy City, PC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
