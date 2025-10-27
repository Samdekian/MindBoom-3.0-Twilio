
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Mic, Volume2, Share2 } from "lucide-react";

const VideoConferenceUserGuide = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Video Conference User Guide</CardTitle>
        <CardDescription>
          Learn how to use our video conferencing platform effectively
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="getting-started">
          <TabsList className="mb-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="preparation">
                <AccordionTrigger>Before You Join</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Test your camera and microphone</li>
                    <li>Find a quiet, well-lit location</li>
                    <li>Close unnecessary applications on your device</li>
                    <li>Use headphones if possible to avoid echo</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="joining">
                <AccordionTrigger>Joining a Session</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Click on your scheduled appointment</li>
                    <li>Select "Join Video Session"</li>
                    <li>Allow browser permissions for camera and microphone</li>
                    <li>Check your preview to ensure you're properly visible</li>
                    <li>Click "Join Session" to enter</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="controls">
                <AccordionTrigger>Basic Controls</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Camera Toggle</h4>
                        <p className="text-sm text-muted-foreground">Turn your video on/off</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Microphone Toggle</h4>
                        <p className="text-sm text-muted-foreground">Mute/unmute your microphone</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Audio Controls</h4>
                        <p className="text-sm text-muted-foreground">Adjust speaker volume</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Screen Sharing</h4>
                        <p className="text-sm text-muted-foreground">Share your screen with participants</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="features">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Collaborative Whiteboard</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the whiteboard to draw and share ideas in real-time.
                </p>
                <ul className="list-disc pl-6 text-sm">
                  <li>Click the whiteboard icon to open</li>
                  <li>Select drawing tools from the toolbar</li>
                  <li>All participants can draw simultaneously</li>
                  <li>Save drawings for later reference</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">In-Session Chat</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Send messages without interrupting the conversation.
                </p>
                <ul className="list-disc pl-6 text-sm">
                  <li>Click the chat icon to open the panel</li>
                  <li>Type messages and press enter to send</li>
                  <li>Share files by clicking the attachment icon</li>
                  <li>Chat history is saved with the session</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Session Recording</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Record sessions for later review (requires consent).
                </p>
                <ul className="list-disc pl-6 text-sm">
                  <li>Therapists can initiate recording</li>
                  <li>Patients will be asked for consent</li>
                  <li>A red indicator shows when recording is active</li>
                  <li>Recordings are encrypted and stored securely</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="troubleshooting">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="connection">
                <AccordionTrigger>Connection Issues</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Check your internet connection</li>
                    <li>Refresh the page</li>
                    <li>Try using a wired connection instead of WiFi</li>
                    <li>Close other applications using your bandwidth</li>
                    <li>Reduce video quality in settings if needed</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="audio-video">
                <AccordionTrigger>Audio/Video Problems</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Check if your camera/microphone are properly connected</li>
                    <li>Ensure you've given browser permissions</li>
                    <li>Select the correct devices in settings</li>
                    <li>Try using different devices if available</li>
                    <li>Restart your browser</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="echo">
                <AccordionTrigger>Echo or Feedback</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use headphones to prevent speaker output feeding back into microphone</li>
                    <li>Reduce speaker volume</li>
                    <li>One participant should mute when not speaking</li>
                    <li>Ensure you're not in a very reflective room</li>
                    <li>Move devices further apart</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="contact">
                <AccordionTrigger>Getting Help</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">If you continue to experience issues:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Contact technical support at support@example.com</li>
                    <li>Provide details about your device and browser</li>
                    <li>Describe exactly what's happening</li>
                    <li>For urgent session issues, call (555) 123-4567</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VideoConferenceUserGuide;
