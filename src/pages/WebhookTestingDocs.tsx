
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";

const WebhookTestingDocs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Webhook Testing Guide</h1>
            <p className="text-muted-foreground">
              Comprehensive guide for testing Calendly webhook integrations
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Webhook Testing</CardTitle>
              <CardDescription>
                Learn how to effectively test your webhook implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Prerequisites</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Configured Calendly webhook signing secret</li>
                  <li>Access to the webhook testing interface</li>
                  <li>Basic understanding of webhook events</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Testing Features</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Basic Signature Verification</h4>
                      <p className="text-muted-foreground">
                        Test webhook signature verification with a simple event payload
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Advanced Event Testing</h4>
                      <p className="text-muted-foreground">
                        Test different event types and payload structures
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Testing Best Practices</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Always test with your production webhook secret</li>
                    <li>Verify signature validation for each event type</li>
                    <li>Monitor webhook test results in the event log</li>
                    <li>Test both successful and error scenarios</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-xl font-semibold mb-2">Security Considerations</h3>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">
                      All webhook tests are performed with secure signature verification to ensure
                      the safety of your integration. Test payloads are generated locally and
                      do not interact with production data.
                    </p>
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

export default WebhookTestingDocs;
