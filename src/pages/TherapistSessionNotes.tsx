
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TherapistSessionNotes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");

  // Mock session notes data
  const sessionNotes = [
    {
      id: 1,
      patient: "Sarah Johnson",
      date: "2024-06-20",
      time: "10:00 AM",
      duration: "45 minutes",
      type: "Individual Therapy",
      status: "completed",
      notes: "Patient showed significant improvement in anxiety management techniques. Discussed coping strategies for workplace stress.",
      goals: ["Practice deep breathing exercises", "Implement mindfulness daily"],
      mood: "Improved",
      nextSession: "2024-06-27"
    },
    {
      id: 2,
      patient: "Mike Chen",
      date: "2024-06-20",
      time: "2:00 PM",
      duration: "60 minutes",
      type: "Depression Counseling",
      status: "completed",
      notes: "Explored cognitive restructuring techniques. Patient expressed feeling more hopeful about future goals.",
      goals: ["Complete thought record exercise", "Engage in social activities"],
      mood: "Stable",
      nextSession: "2024-06-24"
    },
    {
      id: 3,
      patient: "Emma Davis",
      date: "2024-06-19",
      time: "4:30 PM",
      duration: "45 minutes",
      type: "PTSD Therapy",
      status: "completed",
      notes: "Continued EMDR therapy session. Patient reported reduced intensity of traumatic memories.",
      goals: ["Practice grounding techniques", "Continue self-care routine"],
      mood: "Cautiously optimistic",
      nextSession: "2024-06-26"
    }
  ];

  const filteredNotes = sessionNotes.filter(note => {
    const matchesSearch = note.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPatient = selectedPatient === "all" || note.patient === selectedPatient;
    return matchesSearch && matchesPatient;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Session Notes</h1>
          <p className="text-gray-600">Document and track your therapy sessions</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes or patient names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
              <SelectItem value="Mike Chen">Mike Chen</SelectItem>
              <SelectItem value="Emma Davis">Emma Davis</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Session Note
          </Button>
        </div>

        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notes">Session Notes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Notes Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>{note.patient}</span>
                        <Badge className={getStatusColor(note.status)}>
                          {note.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {note.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {note.time}
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {note.type}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Session Notes</h4>
                      <p className="text-gray-700">{note.notes}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Treatment Goals</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {note.goals.map((goal, index) => (
                          <li key={index} className="text-gray-700">{goal}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        <span className="text-sm font-medium">Patient Mood: </span>
                        <span className="text-sm text-gray-600">{note.mood}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Next Session: </span>
                        <span className="text-sm text-gray-600">{note.nextSession}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Session Note Templates</CardTitle>
                <CardDescription>Pre-defined templates to streamline your note-taking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Anxiety Therapy</h4>
                      <p className="text-sm text-gray-600">Template for anxiety-focused sessions</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Depression Counseling</h4>
                      <p className="text-sm text-gray-600">Template for depression treatment sessions</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">PTSD Therapy</h4>
                      <p className="text-sm text-gray-600">Template for trauma-focused therapy</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Notes Analytics</CardTitle>
                <CardDescription>Insights from your session documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">127</div>
                    <p className="text-sm text-gray-600">Total Notes This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">8.5</div>
                    <p className="text-sm text-gray-600">Avg. Notes Per Day</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">95%</div>
                    <p className="text-sm text-gray-600">Documentation Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TherapistSessionNotes;
