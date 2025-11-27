
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Video, Users, Settings } from 'lucide-react';
import { useInstantSessions } from '@/hooks/use-instant-sessions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const InstantSessionCreator: React.FC = () => {
  const navigate = useNavigate();
  const { createInstantSession, loading } = useInstantSessions();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    session_name: '',
    max_participants: 2,
    duration_hours: 1,
    recording_enabled: false,
    waiting_room_enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.session_name.trim()) {
      toast.error('Session name is required');
      return;
    }

    try {
      console.log('🎬 Starting session creation process...');
      const session = await createInstantSession(formData);
      
      if (session) {
        console.log('✅ Session created, navigating to:', `/video-conference/${session.id}`);
        setOpen(false);
        toast.success('Instant session created successfully!');
        
        // Navigate to the video conference with the session ID
        navigate(`/video-conference/${session.id}`);
        
        // Reset form
        setFormData({
          session_name: '',
          max_participants: 2,
          duration_hours: 1,
          recording_enabled: false,
          waiting_room_enabled: true,
        });
      } else {
        console.error('❌ No session returned from creation');
        toast.error('Failed to create session - no session data returned');
      }
    } catch (error) {
      console.error('❌ Error creating instant session:', error);
      toast.error('Failed to create instant session. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Start Instant Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Instant Session
          </DialogTitle>
          <DialogDescription>Set session details and invite participants.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session_name">Session Name *</Label>
            <Input
              id="session_name"
              value={formData.session_name}
              onChange={(e) => handleInputChange('session_name', e.target.value)}
              placeholder="Enter session name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                min="2"
                max="10"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_hours">Duration (hours)</Label>
              <Input
                id="duration_hours"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={formData.duration_hours}
                onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="recording_enabled">Enable Recording</Label>
              <Switch
                id="recording_enabled"
                checked={formData.recording_enabled}
                onCheckedChange={(checked) => handleInputChange('recording_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="waiting_room_enabled">Enable Waiting Room</Label>
              <Switch
                id="waiting_room_enabled"
                checked={formData.waiting_room_enabled}
                onCheckedChange={(checked) => handleInputChange('waiting_room_enabled', checked)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Settings className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Create Session
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstantSessionCreator;
