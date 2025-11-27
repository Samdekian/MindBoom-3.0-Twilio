import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  const handleCreateGroup = () => {
    // Implement group creation logic here
    console.log('Creating group with:', {
      name: groupName,
      description: groupDescription,
      patients: selectedPatients,
    });
    onClose();
  };

  const togglePatientSelection = (patientId: string) => {
    if (selectedPatients.includes(patientId)) {
      setSelectedPatients(selectedPatients.filter((id) => id !== patientId));
    } else {
      setSelectedPatients([...selectedPatients, patientId]);
    }
  };

  // Mock patient data for demonstration
  const mockPatients = [
    { id: '1', name: 'Alice Smith' },
    { id: '2', name: 'Bob Johnson' },
    { id: '3', name: 'Charlie Brown' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Patient Group</DialogTitle>
          <DialogDescription>
            Create a new group to organize and manage your patients.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Group Name
            </Label>
            <Input id="name" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div>
            <Label>Select Patients</Label>
            <div className="border rounded-md p-2 mt-1">
              {mockPatients.map((patient) => (
                <div key={patient.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`patient-${patient.id}`}
                    checked={selectedPatients.includes(patient.id)}
                    onCheckedChange={() => togglePatientSelection(patient.id)}
                  />
                  <Label htmlFor={`patient-${patient.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {patient.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateGroup}>
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
