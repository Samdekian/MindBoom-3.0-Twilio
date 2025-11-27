
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Code,
  FileJson,
  Check,
  AlertTriangle,
  HelpCircle, 
  Download,
  Send,
  ExternalLink
} from "lucide-react";

const WebhookDocumentation = () => {
  return (
    <>
      <Helmet>
        <title>Webhook Documentation | MindBloom</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Webhook Documentation</h1>
          <p className="text-muted-foreground mb-8">
            Comprehensive guide to using webhooks with the MindBloom platform
          </p>

          <Tabs defaultValue="overview" className="w-full mb-8">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Event Types</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="logging">Event Logging</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Overview</CardTitle>
                  <CardDescription>
                    How to integrate with MindBloom's calendar webhook system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">What are Webhooks?</h3>
                    <p>
                      Webhooks provide a way for MindBloom to send real-time notifications to your
                      system when calendar events occur. Instead of continuously polling our API for changes,
                      your application receives instant updates when events happen.
                    </p>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-md font-medium mb-2">Key Benefits:</h4>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Real-time updates for appointment changes</li>
                        <li>Reduced API load with push-based notifications</li>
                        <li>Automatic synchronization of calendar events</li>
                        <li>Immediate conflict detection and resolution</li>
                        <li>Seamless integration with your existing systems</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Setting Up Webhooks</h3>
                    <div className="bg-muted p-4 rounded-md space-y-4">
                      <ol className="list-decimal list-inside space-y-4 pl-2">
                        <li>
                          <strong>Register a Webhook Endpoint:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create an endpoint on your server to receive webhook events. This should be a publicly accessible URL.
                          </p>
                        </li>
                        <li>
                          <strong>Configure Webhook in MindBloom:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Navigate to your Dashboard &gt; Calendar Settings &gt; Webhooks to add your endpoint.
                          </p>
                        </li>
                        <li>
                          <strong>Generate a Webhook Secret:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create a secret key to verify webhook authenticity.
                          </p>
                        </li>
                        <li>
                          <strong>Subscribe to Events:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Choose which event types you want to receive notifications for.
                          </p>
                        </li>
                        <li>
                          <strong>Implement Event Handling:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Develop logic to process incoming webhook events.
                          </p>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security Best Practices</h3>
                    <p>
                      To ensure the security of your webhook integration:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li>
                        <strong>Verify Webhook Signatures:</strong> Validate incoming requests using the webhook secret
                      </li>
                      <li>
                        <strong>Use HTTPS:</strong> Always use encrypted connections for webhook endpoints
                      </li>
                      <li>
                        <strong>Implement Timeouts:</strong> Set reasonable timeouts for webhook processing
                      </li>
                      <li>
                        <strong>Store Event IDs:</strong> Track processed events to prevent duplicate processing
                      </li>
                      <li>
                        <strong>Implement Retry Logic:</strong> Handle temporary failures gracefully
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Important Note</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Webhook endpoints must respond with a 200-level status code within 5 seconds to acknowledge 
                          receipt of the event. For processing that takes longer, acknowledge receipt immediately and 
                          handle the event asynchronously.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Event Types</CardTitle>
                  <CardDescription>
                    Detailed information about the different webhook events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Event Structure</h3>
                    <p>
                      All webhook events share a common JSON structure:
                    </p>
                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
{`{
  "id": "evt_123456789",
  "type": "appointment.created",
  "created_at": "2023-05-01T12:00:00Z",
  "data": {
    // Event-specific payload
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="event-1">
                      <AccordionTrigger className="flex gap-2">
                        <span>appointment.created</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Common
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Triggered when a new appointment is scheduled.
                          </p>
                          <div className="bg-muted p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm">
{`{
  "id": "evt_123456789",
  "type": "appointment.created",
  "created_at": "2023-05-01T12:00:00Z",
  "data": {
    "appointment": {
      "id": "apt_987654321",
      "patient_id": "usr_123456789",
      "therapist_id": "usr_987654321",
      "start_time": "2023-05-15T14:00:00Z",
      "end_time": "2023-05-15T15:00:00Z",
      "status": "scheduled",
      "title": "Therapy Session",
      "description": "Regular therapy session"
    }
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="event-2">
                      <AccordionTrigger className="flex gap-2">
                        <span>appointment.updated</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Common
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Triggered when an appointment is updated (time change, details updated, etc).
                          </p>
                          <div className="bg-muted p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm">
{`{
  "id": "evt_123456790",
  "type": "appointment.updated",
  "created_at": "2023-05-02T10:30:00Z",
  "data": {
    "appointment": {
      "id": "apt_987654321",
      "patient_id": "usr_123456789",
      "therapist_id": "usr_987654321",
      "start_time": "2023-05-16T15:00:00Z", // Updated time
      "end_time": "2023-05-16T16:00:00Z",   // Updated time
      "status": "scheduled",
      "title": "Therapy Session",
      "description": "Rescheduled therapy session"
    },
    "previous_values": {
      "start_time": "2023-05-15T14:00:00Z",
      "end_time": "2023-05-15T15:00:00Z"
    }
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="event-3">
                      <AccordionTrigger className="flex gap-2">
                        <span>appointment.cancelled</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Common
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Triggered when an appointment is cancelled.
                          </p>
                          <div className="bg-muted p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm">
{`{
  "id": "evt_123456791",
  "type": "appointment.cancelled",
  "created_at": "2023-05-03T09:15:00Z",
  "data": {
    "appointment": {
      "id": "apt_987654321",
      "patient_id": "usr_123456789",
      "therapist_id": "usr_987654321",
      "start_time": "2023-05-16T15:00:00Z",
      "end_time": "2023-05-16T16:00:00Z",
      "status": "cancelled",
      "title": "Therapy Session",
      "description": "Cancelled therapy session",
      "cancellation_reason": "Patient request"
    }
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="event-4">
                      <AccordionTrigger className="flex gap-2">
                        <span>calendar.sync</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          Advanced
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Triggered when a calendar sync operation is performed.
                          </p>
                          <div className="bg-muted p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm">
{`{
  "id": "evt_123456792",
  "type": "calendar.sync",
  "created_at": "2023-05-04T11:20:00Z",
  "data": {
    "user_id": "usr_987654321",
    "calendar_id": "cal_123456789",
    "calendar_provider": "google",
    "sync_status": "completed",
    "sync_type": "full",
    "events_created": 3,
    "events_updated": 1,
    "events_deleted": 0,
    "conflicts_detected": 1
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="event-5">
                      <AccordionTrigger className="flex gap-2">
                        <span>calendar.conflict</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                          Important
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Triggered when a calendar conflict is detected.
                          </p>
                          <div className="bg-muted p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm">
{`{
  "id": "evt_123456793",
  "type": "calendar.conflict",
  "created_at": "2023-05-05T13:45:00Z",
  "data": {
    "user_id": "usr_987654321",
    "appointment_id": "apt_123456789",
    "calendar_id": "cal_123456789",
    "calendar_provider": "google",
    "conflict_events": [
      {
        "event_id": "evt_google_123456",
        "title": "Team Meeting",
        "start_time": "2023-05-20T14:00:00Z",
        "end_time": "2023-05-20T15:00:00Z"
      }
    ],
    "appointment": {
      "id": "apt_123456789",
      "start_time": "2023-05-20T14:30:00Z",
      "end_time": "2023-05-20T15:30:00Z",
      "status": "scheduled"
    }
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <Link to="/project-documentation">
                      <FileJson className="h-4 w-4" />
                      View All Event Types
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="testing">
              <Card>
                <CardHeader>
                  <CardTitle>Testing Webhooks</CardTitle>
                  <CardDescription>
                    Tools and best practices for testing your webhook integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Testing Process</h3>
                    <p>
                      Testing your webhook integration is crucial to ensure reliable operation in production.
                      MindBloom provides several tools to help you test and debug your webhook implementation.
                    </p>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-md font-medium mb-2">Testing Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2 pl-4">
                        <li>Set up a webhook endpoint (production or testing environment)</li>
                        <li>Register your endpoint in the MindBloom Dashboard</li>
                        <li>Use the Webhook Tester to send sample events</li>
                        <li>Verify signature verification works correctly</li>
                        <li>Ensure proper error handling and retry logic</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Using the Webhook Tester</h3>
                    <p>
                      The MindBloom Dashboard includes a Webhook Tester tool that allows you to send sample events to your endpoint.
                    </p>
                    <div className="bg-muted p-4 rounded-md space-y-4">
                      <ol className="list-decimal list-inside space-y-4 pl-2">
                        <li>
                          <strong>Access the Tester:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Navigate to Dashboard &gt; Calendar Settings &gt; Webhooks &gt; Test Webhooks
                          </p>
                        </li>
                        <li>
                          <strong>Select an Event Type:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Choose which event type you want to test
                          </p>
                        </li>
                        <li>
                          <strong>Customize Payload (Optional):</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Modify the event payload for specific test cases
                          </p>
                        </li>
                        <li>
                          <strong>Send the Test Event:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Click "Send Test Event" to deliver the webhook to your endpoint
                          </p>
                        </li>
                        <li>
                          <strong>Review the Results:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Check the response code and time, and view detailed logs
                          </p>
                        </li>
                      </ol>
                    </div>

                    <div className="flex justify-center">
                      <Button className="flex items-center gap-2" asChild>
                        <Link to="/dashboard">
                          <Send className="h-4 w-4" />
                          Go to Webhook Tester
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Using Local Development Tools</h3>
                    <p>
                      For local testing, you can use tools that create temporary public URLs for your local server:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li>
                        <strong>ngrok:</strong> Creates a secure tunnel to your local server
                      </li>
                      <li>
                        <strong>Webhook.site:</strong> Provides a temporary endpoint that logs all requests
                      </li>
                      <li>
                        <strong>Pipedream:</strong> Build and test API workflows with webhooks
                      </li>
                    </ul>

                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Testing Tip</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            When using tunneling solutions like ngrok, make sure to update your webhook URL in the 
                            MindBloom Dashboard whenever your tunnel URL changes. Most tunneling services generate 
                            a new URL each time they start unless you have a paid account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Testing Signature Verification</h3>
                    <p>
                      Verifying webhook signatures is essential for security. Here's how to test signature verification:
                    </p>
                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
{`// Node.js example of signature verification
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Express middleware example
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-mindbloom-signature'];
  const payload = req.body.toString();
  
  if (!verifySignature(payload, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook event
  const event = JSON.parse(payload);
  // ...
  
  res.status(200).send();
});`}
                      </pre>
                    </div>
                  </div>

                  <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Best Practice</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Always maintain an event log for debugging and audit purposes. Each webhook event should be 
                          recorded with its event ID, timestamp, type, and processing status. This helps track 
                          delivery, identify processing issues, and prevent duplicate processing.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <a href="https://github.com/mindbloom/webhook-examples" target="_blank" rel="noopener noreferrer">
                      <Code className="h-4 w-4" />
                      Sample Code Repository
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="logging">
              <Card>
                <CardHeader>
                  <CardTitle>Event Logging</CardTitle>
                  <CardDescription>
                    Best practices for logging and managing webhook events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Event Logging Overview</h3>
                    <p>
                      Proper event logging is critical for debugging, auditing, and ensuring the reliability
                      of your webhook integration. This section covers best practices for logging webhook events.
                    </p>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-md font-medium mb-2">Why Log Events?</h4>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Track event receipt and processing</li>
                        <li>Identify and troubleshoot delivery issues</li>
                        <li>Prevent duplicate processing of events</li>
                        <li>Create an audit trail for compliance</li>
                        <li>Analyze webhook performance and reliability</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Logging Implementation</h3>
                    <p>
                      Implement comprehensive logging for all webhook interactions:
                    </p>
                    
                    <div className="bg-muted p-4 rounded-md space-y-4">
                      <ol className="list-decimal list-inside space-y-4 pl-2">
                        <li>
                          <strong>Create an Event Log Table:</strong>
                          <div className="text-sm text-muted-foreground mt-1 overflow-x-auto">
                            <pre>
{`CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_status TEXT NOT NULL,
  payload JSONB,
  processing_errors TEXT,
  retry_count INTEGER DEFAULT 0
);`}
                            </pre>
                          </div>
                        </li>
                        <li>
                          <strong>Log Incoming Events:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Record every webhook event when it's received before processing:
                          </p>
                          <div className="text-sm text-muted-foreground mt-1 overflow-x-auto">
                            <pre>
{`INSERT INTO webhook_events 
  (event_id, event_type, received_at, processing_status, payload)
VALUES 
  ('evt_123456789', 'appointment.created', NOW(), 'pending', $1);`}
                            </pre>
                          </div>
                        </li>
                        <li>
                          <strong>Update Processing Status:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            Update the log when processing is complete or fails:
                          </p>
                          <div className="text-sm text-muted-foreground mt-1 overflow-x-auto">
                            <pre>
{`-- Success
UPDATE webhook_events 
SET processed_at = NOW(), 
    processing_status = 'completed' 
WHERE event_id = 'evt_123456789';

-- Failure
UPDATE webhook_events 
SET processing_status = 'failed', 
    processing_errors = 'Error description',
    retry_count = retry_count + 1 
WHERE event_id = 'evt_123456789';`}
                            </pre>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Event Log Management</h3>
                    <p>
                      Best practices for managing your webhook event logs:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li>
                        <strong>Implement a Retention Policy:</strong> Define how long to keep event logs
                      </li>
                      <li>
                        <strong>Create Log Rotation:</strong> Archive old logs to maintain performance
                      </li>
                      <li>
                        <strong>Set Up Monitoring:</strong> Alert on failed events or processing bottlenecks
                      </li>
                      <li>
                        <strong>Build a Management UI:</strong> Create an interface to view and manage events
                      </li>
                      <li>
                        <strong>Implement Retry Logic:</strong> Automatically retry failed events
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Sample Log Query</h4>
                        <p className="text-sm text-green-700 mt-1">
                          To find problematic webhook events, you can use a query like this:
                        </p>
                        <pre className="text-sm text-green-700 mt-2 bg-white p-2 rounded">
{`SELECT 
  event_id, 
  event_type, 
  received_at, 
  processing_status, 
  retry_count, 
  processing_errors
FROM webhook_events
WHERE processing_status = 'failed'
  AND retry_count < 3
  AND received_at > NOW() - INTERVAL '24 hours'
ORDER BY received_at DESC;`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Log Visualization and Analysis</h3>
                    <p>
                      Consider implementing visualization tools to gain insights from your webhook logs:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li>
                        <strong>Processing Success Rate:</strong> Track percentage of successful events over time
                      </li>
                      <li>
                        <strong>Processing Time:</strong> Monitor how long events take to process
                      </li>
                      <li>
                        <strong>Event Volume:</strong> Analyze patterns in event frequency and types
                      </li>
                      <li>
                        <strong>Error Distribution:</strong> Identify common failure reasons
                      </li>
                    </ul>

                    <div className="flex justify-center">
                      <Button variant="outline" className="flex items-center gap-2" asChild>
                        <a href="#" download>
                          <Download className="h-4 w-4" />
                          Download Sample Log Schema
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default WebhookDocumentation;
