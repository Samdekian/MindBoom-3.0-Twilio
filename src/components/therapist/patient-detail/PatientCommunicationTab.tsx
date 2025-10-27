
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { Send, Phone, Video, Mail, MessageCircle, Calendar } from 'lucide-react';

interface PatientCommunicationTabProps {
  patientId: string;
}

const PatientCommunicationTab: React.FC<PatientCommunicationTabProps> = ({ patientId }) => {
  const { user } = useAuthRBAC();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Therapist',
      content: 'Hello, how are you feeling today?',
      timestamp: '2024-03-15T09:30:00Z',
    },
    {
      id: '2',
      sender: 'Patient',
      content: 'I am feeling much better, thank you!',
      timestamp: '2024-03-15T09:45:00Z',
    },
  ]);

  const handleSendMessage = () => {
    if (message) {
      const newMessage = {
        id: String(messages.length + 1),
        sender: 'Therapist',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Communication</CardTitle>
        <CardDescription>Communicate with the patient via secure messaging.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className="border rounded-md p-2">
              <div className="text-sm font-semibold">{msg.sender}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
              <div>{msg.content}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-green-500" />
              <div>
                <CardTitle>Call Patient</CardTitle>
                <CardDescription>Initiate a phone call with the patient.</CardDescription>
                <Button variant="secondary">Start Call</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <Video className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Video Call</CardTitle>
                <CardDescription>Start a video call session.</CardDescription>
                <Button variant="secondary">Start Video Call</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle>Send Email</CardTitle>
                <CardDescription>Send an email to the patient.</CardDescription>
                <Button variant="secondary">Compose Email</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <Calendar className="h-6 w-6 text-purple-500" />
              <div>
                <CardTitle>Schedule Appointment</CardTitle>
                <CardDescription>Schedule a new appointment with the patient.</CardDescription>
                <Button variant="secondary">Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCommunicationTab;
