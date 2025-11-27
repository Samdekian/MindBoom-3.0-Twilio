
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export interface TreatmentPlanFormProps {
  onSuccess?: () => void;
}

const TreatmentPlanForm: React.FC<TreatmentPlanFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock submission
    toast({
      title: "Treatment Plan Created",
      description: "The treatment plan has been successfully created.",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Treatment Plan</CardTitle>
        <CardDescription>Create a comprehensive treatment plan for your patient</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Plan Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter treatment plan title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the treatment approach and goals"
              rows={4}
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Create Treatment Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanForm;
