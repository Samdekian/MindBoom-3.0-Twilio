import React, { useState, useEffect } from 'react';
import { Copy, Users, Clock, Share2, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useInstantSessions } from '@/hooks/use-instant-sessions';
import { useInstantSession } from '@/hooks/use-instant-session';

interface SessionShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export const SessionShareDialog: React.FC<SessionShareDialogProps> = ({
  open,
  onOpenChange,
  sessionId,
}) => {
  const { generateShareableLink } = useInstantSessions();
  const { sessionDetails } = useInstantSession(sessionId);
  const { toast } = useToast();
  const [shareLink, setShareLink] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  // Generate shareable link when session details are loaded
  useEffect(() => {
    if (sessionDetails) {
      const link = generateShareableLink(sessionDetails.session_token);
      setShareLink(link);
    }
  }, [sessionDetails, generateShareableLink]);

  // Calculate time remaining
  useEffect(() => {
    if (!sessionDetails) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(sessionDetails.expires_at);
      const diffMs = expires.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionDetails]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: 'Link Copied',
        description: 'Session link copied to clipboard!',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  const shareViaEmail = () => {
    const subject = `Join my video session: ${sessionDetails?.session_name}`;
    const body = `You're invited to join my video session!\n\nSession: ${sessionDetails?.session_name}\nLink: ${shareLink}\n\nThis link expires in ${timeRemaining}.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    const message = `Join my video session: ${sessionDetails?.session_name}\n${shareLink}\n\nExpires in ${timeRemaining}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  if (!sessionDetails) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Invite Participants
          </DialogTitle>
          <DialogDescription>
            Share this link to invite others to join your session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <h4 className="font-medium">{sessionDetails.session_name}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Max {sessionDetails.max_participants} participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeRemaining}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {sessionDetails.recording_enabled && (
                <Badge variant="secondary" className="text-xs">
                  Recording Enabled
                </Badge>
              )}
              {sessionDetails.waiting_room_enabled && (
                <Badge variant="outline" className="text-xs">
                  Waiting Room
                </Badge>
              )}
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Link</label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Via</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaEmail}
                className="text-sm"
              >
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaWhatsApp}
                className="text-sm"
              >
                WhatsApp
              </Button>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="flex justify-center p-4 border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <QrCode className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">QR Code</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={copyToClipboard} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};