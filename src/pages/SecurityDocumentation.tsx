
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  Eye, 
  Clock
} from "lucide-react";

const SecurityDocumentation = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Security Documentation</h1>
            <p className="text-muted-foreground">
              Comprehensive overview of security features and compliance measures
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-500" />
                Security Framework Overview
              </CardTitle>
              <CardDescription>
                Our platform implements multiple layers of security to protect sensitive healthcare information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Core Security Components</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium">Two-Factor Authentication (2FA)</span>
                    <p className="text-muted-foreground">Additional security layer requiring verification beyond password</p>
                  </li>
                  <li>
                    <span className="font-medium">Role-Based Access Control</span>
                    <p className="text-muted-foreground">Granular permissions based on user roles</p>
                  </li>
                  <li>
                    <span className="font-medium">Comprehensive Audit Logging</span>
                    <p className="text-muted-foreground">Tracking of all security-critical operations</p>
                  </li>
                  <li>
                    <span className="font-medium">Data Encryption</span>
                    <p className="text-muted-foreground">End-to-end encryption for sensitive data</p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">HIPAA Compliance</h3>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">
                      Our platform is designed with HIPAA compliance as a priority. We implement:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>PHI encryption in transit and at rest</li>
                      <li>Strict access controls for protected health information</li>
                      <li>Comprehensive audit trails for all PHI access</li>
                      <li>Secure backup and recovery procedures</li>
                      <li>Regular security risk assessments</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Best Practices</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Always use strong, unique passwords</li>
                    <li>Enable two-factor authentication for all accounts</li>
                    <li>Regularly review your account activity for suspicious events</li>
                    <li>Keep your devices and software updated</li>
                    <li>Log out of your account when using shared devices</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-xl font-semibold mb-2">Audit Logging</h3>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">
                      Our comprehensive audit logging system tracks all security-relevant actions:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Authentication events (login, logout, failed attempts)</li>
                      <li>Profile and security setting changes</li>
                      <li>Access to protected health information</li>
                      <li>System configuration changes</li>
                      <li>All security-critical operations with timestamp and user information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Role-Based Access Control</h3>
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">
                      Our platform implements role-based access control to ensure users can only access data they are authorized to view:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Different permission sets for patients and therapists</li>
                      <li>Administrative controls for system management</li>
                      <li>Fine-grained permission controls based on user roles</li>
                      <li>Regular permission reviews and auditing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Security Assessments</h3>
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">
                      We conduct regular security assessments to identify and address potential vulnerabilities:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Regular vulnerability scanning</li>
                      <li>Penetration testing by security professionals</li>
                      <li>Code security reviews</li>
                      <li>Third-party security assessments</li>
                      <li>Continuous monitoring for suspicious activity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityDocumentation;
