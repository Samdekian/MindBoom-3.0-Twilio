import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTagDialog = ({ open, onOpenChange }: CreateTagDialogProps) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    color: '#6B7280'
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('patient_tags')
        .insert({
          ...data,
          created_by: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Tag Created",
        description: "Patient tag has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['patient-tags'] });
      onOpenChange(false);
      setFormData({
        name: '',
        category: 'general',
        color: '#6B7280'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    createTagMutation.mutate(formData);
  };

  const colorOptions = [
    { value: '#6B7280', label: 'Gray' },
    { value: '#EF4444', label: 'Red' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#10B981', label: 'Green' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#06B6D4', label: 'Cyan' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Patient Tag</DialogTitle>
          <DialogDescription>
            Create a new tag to categorize your patients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tag Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tag name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="condition">Condition</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border" 
                style={{ backgroundColor: formData.color }}
              />
              <Select 
                value={formData.color} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTagMutation.isPending}>
              {createTagMutation.isPending ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTagDialog;
