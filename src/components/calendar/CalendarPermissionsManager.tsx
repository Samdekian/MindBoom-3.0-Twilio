
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Shield, Plus, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Mock data for demonstration
const mockSharedUsers = [
  { id: 1, email: 'colleague@example.com', role: 'view', calendarId: 'primary' },
  { id: 2, email: 'assistant@example.com', role: 'edit', calendarId: 'primary' }
];

const CalendarPermissionsManager = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sharedUsers, setSharedUsers] = useState(mockSharedUsers);
  
  const handleRemoveUser = (id: number) => {
    setSharedUsers(sharedUsers.filter(user => user.id !== id));
  };
  
  const handleAddUser = (formData: FormData) => {
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const calendarId = formData.get('calendar') as string;
    
    if (email && role) {
      setSharedUsers([
        ...sharedUsers,
        { 
          id: Date.now(),
          email,
          role,
          calendarId
        }
      ]);
    }
    
    setIsAddDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Calendar Sharing & Permissions
        </CardTitle>
        <CardDescription>
          Manage who can view and edit your calendar appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Shared With</h3>
              <p className="text-sm text-muted-foreground">People with access to your calendar</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Calendar</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.calendarId === 'primary' ? 'Primary Calendar' : user.calendarId}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {sharedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No shared users yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <h3 className="font-medium">Public Calendar</h3>
                <p className="text-sm text-muted-foreground">Make your calendar publicly viewable</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div>
                <h3 className="font-medium">Hide Appointment Details</h3>
                <p className="text-sm text-muted-foreground">Show only availability, not appointment details</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </CardContent>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Calendar</DialogTitle>
            <DialogDescription>
              Give someone access to view or edit your calendar
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddUser(new FormData(e.currentTarget as HTMLFormElement));
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="colleague@example.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="calendar">Calendar</Label>
                <Select name="calendar" defaultValue="primary">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Calendar</SelectItem>
                    <SelectItem value="work">Work Calendar</SelectItem>
                    <SelectItem value="personal">Personal Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Permission Level</Label>
                <Select name="role" defaultValue="view">
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="edit">Make changes</SelectItem>
                    <SelectItem value="manage">Make changes & manage sharing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Share</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarPermissionsManager;
