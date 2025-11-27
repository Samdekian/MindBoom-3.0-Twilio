
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useTreatmentPlans, TreatmentGoal, TreatmentMilestone } from '@/hooks/use-treatment-plans';

export interface MilestonesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGoal: TreatmentGoal | null;
  milestones: TreatmentMilestone[];
  patientId: string;
}

const MilestonesDrawer: React.FC<MilestonesDrawerProps> = ({
  isOpen,
  onClose,
  selectedGoal,
  milestones,
  patientId,
}) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const { createMilestone, toggleMilestoneCompletion } = useTreatmentPlans(patientId);

  // Reset form when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setNewMilestoneTitle('');
      setNewMilestoneDescription('');
      setNewMilestoneDueDate('');
    }
  }, [isOpen]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date set';
    
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) {
        return format(date, 'MMMM d, yyyy');
      }
      return 'Invalid date';
    } catch (err) {
      return 'Invalid date format';
    }
  };

  // Handle creating a new milestone
  const handleCreateMilestone = async () => {
    if (!selectedGoal || !newMilestoneTitle || !newMilestoneDueDate) return;
    
    createMilestone.mutate({
      goal_id: selectedGoal.id,
      title: newMilestoneTitle,
      description: newMilestoneDescription,
      due_date: newMilestoneDueDate,
    });

    // Reset form
    setNewMilestoneTitle('');
    setNewMilestoneDescription('');
    setNewMilestoneDueDate('');
  };

  // Filter milestones for the selected goal
  const filteredMilestones = milestones.filter(
    milestone => selectedGoal && milestone.goal_id === selectedGoal.id
  );

  // Group milestones by completion status
  const completedMilestones = filteredMilestones.filter(m => m.is_completed);
  const incompleteMilestones = filteredMilestones.filter(m => !m.is_completed);
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{selectedGoal?.title || 'Milestones'}</SheetTitle>
          <SheetDescription>
            {selectedGoal?.description || 'View and manage milestones for this goal'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <h3 className="text-lg font-medium mb-2">Add New Milestone</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="milestone-title">Milestone Title</Label>
              <Input 
                id="milestone-title" 
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                placeholder="Enter milestone title"
              />
            </div>
            
            <div>
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                value={newMilestoneDescription}
                onChange={e => setNewMilestoneDescription(e.target.value)}
                placeholder="Enter milestone description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="milestone-date">Due Date</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="milestone-date"
                  type="date"
                  value={newMilestoneDueDate}
                  onChange={e => setNewMilestoneDueDate(e.target.value)}
                />
                <CalendarIcon size={16} className="text-muted-foreground" />
              </div>
            </div>
            
            <Button onClick={handleCreateMilestone} disabled={!newMilestoneTitle || !newMilestoneDueDate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </div>
        
        <div className="py-2">
          <h3 className="text-lg font-medium mb-4">Current Milestones</h3>
          
          {incompleteMilestones.length === 0 && completedMilestones.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No milestones have been added yet
            </div>
          )}
          
          {incompleteMilestones.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground">In Progress</h4>
              {incompleteMilestones.map(milestone => (
                <Card key={milestone.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => toggleMilestoneCompletion.mutate(milestone.id)}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Due: {formatDate(milestone.due_date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {completedMilestones.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
              {completedMilestones.map(milestone => (
                <Card key={milestone.id} className="bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => toggleMilestoneCompletion.mutate(milestone.id)}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <CheckCircle2 size={12} className="text-green-500" />
                          <span>Completed: {milestone.created_at ? formatDate(milestone.created_at) : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MilestonesDrawer;
