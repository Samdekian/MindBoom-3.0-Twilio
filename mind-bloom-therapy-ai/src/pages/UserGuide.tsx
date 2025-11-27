
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const UserGuide = () => {
  return (
    <>
      <Helmet>
        <title>User Guide | MindBloom</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">User Guide</h1>
          <p className="text-muted-foreground mb-8">
            Comprehensive guide to using the MindBloom platform
          </p>
          
          <Tabs defaultValue="getting-started" className="w-full mb-8">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full mb-8">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="calendar">Calendar Integration</TabsTrigger>
              <TabsTrigger value="profile">Profile Management</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started with MindBloom</CardTitle>
                  <CardDescription>
                    Learn the basics of using the MindBloom platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Creating Your Account</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            To create your MindBloom account, follow these steps:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Click the "Register" button in the top navigation bar</li>
                            <li>Enter your email address and create a secure password</li>
                            <li>Select your account type (Patient or Therapist)</li>
                            <li>Complete the verification process via email</li>
                            <li>Fill out your profile information</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            Note: For therapist accounts, additional verification steps may be required.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Navigating the Dashboard</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            The MindBloom dashboard is your central hub for all platform features.
                          </p>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>
                              <strong>Appointments Widget:</strong> View upcoming sessions and schedule new ones
                            </li>
                            <li>
                              <strong>Mood Tracker:</strong> Record and monitor your emotional wellbeing
                            </li>
                            <li>
                              <strong>Quick Actions:</strong> Access frequently used features
                            </li>
                            <li>
                              <strong>Progress Metrics:</strong> Track your therapy progress over time
                            </li>
                            <li>
                              <strong>Resources:</strong> Access helpful tools and materials
                            </li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Security Settings</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            MindBloom prioritizes the security of your account and data.
                          </p>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>
                              <strong>Two-Factor Authentication:</strong> Enable for additional security
                            </li>
                            <li>
                              <strong>Password Management:</strong> Regularly update your password
                            </li>
                            <li>
                              <strong>Session Management:</strong> Monitor and control active sessions
                            </li>
                            <li>
                              <strong>Privacy Controls:</strong> Manage what information is shared
                            </li>
                          </ul>
                          <p className="text-muted-foreground text-sm mt-4">
                            We recommend enabling Two-Factor Authentication for optimal security.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Managing Appointments</CardTitle>
                  <CardDescription>
                    Schedule, manage and attend your therapy sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="appointment-1">
                      <AccordionTrigger>Scheduling Appointments</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            To schedule a new appointment:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Click on "Schedule New" in the Appointments widget</li>
                            <li>Select an available therapist from the directory</li>
                            <li>Choose a date from the calendar</li>
                            <li>Select an available time slot</li>
                            <li>Review any potential scheduling conflicts</li>
                            <li>Confirm your appointment</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            You'll receive a confirmation email once your appointment is scheduled.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="appointment-2">
                      <AccordionTrigger>Video Sessions</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            MindBloom provides secure video conferencing for your therapy sessions.
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Join from the dashboard 5 minutes before your session</li>
                            <li>Click the "Join Video" button on your appointment</li>
                            <li>Allow browser permissions for camera and microphone</li>
                            <li>Test your audio and video in the pre-session room</li>
                            <li>Click "Join Session" when ready</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            For the best experience, use a stable internet connection and a quiet, private space.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="appointment-3">
                      <AccordionTrigger>Rescheduling and Cancellations</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Need to change your appointment time?
                          </p>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>
                              <strong>Rescheduling:</strong> Click "Reschedule" on the appointment card to select a new time
                            </li>
                            <li>
                              <strong>Cancellations:</strong> Click "Cancel" on the appointment card
                            </li>
                            <li>
                              <strong>Policy:</strong> Please reschedule or cancel at least 24 hours in advance
                            </li>
                          </ul>
                          <p className="text-muted-foreground text-sm mt-4">
                            Late cancellations may incur a fee as per your therapist's policy.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Integration</CardTitle>
                  <CardDescription>
                    Sync your appointments with your preferred calendar service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="calendar-1">
                      <AccordionTrigger>Google Calendar Integration</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Connect your Google Calendar for seamless appointment synchronization:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Go to the Calendar Integration card on your dashboard</li>
                            <li>Click "Connect with Google Calendar"</li>
                            <li>Sign in to your Google account and authorize MindBloom</li>
                            <li>Select which Google Calendar to use for synchronization</li>
                            <li>Choose your sync preferences</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            Once connected, all your appointments will automatically sync with your Google Calendar.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="calendar-2">
                      <AccordionTrigger>Apple Calendar Integration</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Connect your Apple Calendar for appointment synchronization:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Go to the Calendar Integration card on your dashboard</li>
                            <li>Click "Connect with Apple Calendar"</li>
                            <li>Sign in with your Apple ID and authorize MindBloom</li>
                            <li>Select which calendar to use for synchronization</li>
                            <li>Choose your sync preferences</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            Apple Calendar integration is coming soon.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="calendar-3">
                      <AccordionTrigger>Managing Calendar Conflicts</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            MindBloom helps you avoid scheduling conflicts:
                          </p>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>
                              <strong>Conflict Detection:</strong> The system automatically checks for conflicts with your existing calendar events
                            </li>
                            <li>
                              <strong>Conflict Warnings:</strong> You'll see warnings when scheduling appointments that overlap with existing events
                            </li>
                            <li>
                              <strong>Conflict Resolution:</strong> Choose to reschedule or proceed with conflicting appointments
                            </li>
                          </ul>
                          <p className="text-muted-foreground text-sm mt-4">
                            For optimal conflict detection, ensure your calendar integration is properly configured.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Management</CardTitle>
                  <CardDescription>
                    Customize your profile settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="profile-1">
                      <AccordionTrigger>Updating Profile Information</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Keep your profile information up to date:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Navigate to your Profile page from the top-right menu</li>
                            <li>Click on the "Personal Info" tab</li>
                            <li>Update your name, contact information, and other details</li>
                            <li>Upload or change your profile photo</li>
                            <li>Click "Save Changes" when finished</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            Keeping your profile information current ensures effective communication.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="profile-2">
                      <AccordionTrigger>Notification Preferences</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Customize how you receive notifications:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 pl-4">
                            <li>Go to your Profile page</li>
                            <li>Click on the "Notifications" tab</li>
                            <li>Configure your preferred notification channels (email, SMS, push)</li>
                            <li>Set appointment reminder timing preferences</li>
                            <li>Choose which types of notifications you want to receive</li>
                            <li>Save your preferences</li>
                          </ol>
                          <p className="text-muted-foreground text-sm mt-4">
                            You can update your notification preferences at any time.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="profile-3">
                      <AccordionTrigger>Activity History</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>
                            Monitor your account activity:
                          </p>
                          <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>
                              <strong>Account Activity:</strong> View login history and security events
                            </li>
                            <li>
                              <strong>Therapy Sessions:</strong> See a record of past appointments
                            </li>
                            <li>
                              <strong>Profile Updates:</strong> Track changes made to your profile
                            </li>
                          </ul>
                          <p className="text-muted-foreground text-sm mt-4">
                            Review your activity history regularly for security purposes.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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

export default UserGuide;
