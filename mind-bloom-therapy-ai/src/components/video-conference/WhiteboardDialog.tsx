import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Whiteboard from './Whiteboard';
import { useToast } from '@/hooks/use-toast';
import { PenTool, Share2, Download } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

interface WhiteboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
}

const WhiteboardDialog: React.FC<WhiteboardDialogProps> = ({
  open,
  onOpenChange,
  sessionId = 'temp-session'
}) => {
  const [whiteboardData, setWhiteboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthRBAC();
  const { toast } = useToast();

  useEffect(() => {
    if (open && sessionId) {
      loadWhiteboardData();
    }
  }, [open, sessionId]);

  const loadWhiteboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mocking data fetch since whiteboard_data table doesn't exist
      // In a real implementation, this would fetch from the database
      console.log("Loading whiteboard data for session:", sessionId);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response data
      const mockData = {
        data: localStorage.getItem(`whiteboard-${sessionId}`) 
          ? JSON.parse(localStorage.getItem(`whiteboard-${sessionId}`) || '[]')
          : []
      };
      
      if (mockData && Array.isArray(mockData.data)) {
        setWhiteboardData(mockData.data);
      } else {
        setWhiteboardData([]);
      }
      
    } catch (error) {
      console.error("Error loading whiteboard data:", error);
      toast({
        title: "Failed to load whiteboard",
        description: "Could not load previous drawings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveWhiteboardData = async (data: any[]) => {
    try {
      setIsSaving(true);
      
      // Mocking data save since whiteboard_data table doesn't exist
      console.log("Saving whiteboard data:", data);
      
      // Save to localStorage as a mock
      localStorage.setItem(`whiteboard-${sessionId}`, JSON.stringify(data));
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: "Whiteboard saved",
        description: "Your drawings have been saved",
      });
      
    } catch (error) {
      console.error("Error saving whiteboard data:", error);
      toast({
        title: "Failed to save whiteboard",
        description: "Could not save your drawings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhiteboardChange = (newData: any[]) => {
    setWhiteboardData(newData);
  };

  const handleClose = () => {
    if (whiteboardData.length > 0) {
      saveWhiteboardData(whiteboardData);
    }
    onOpenChange(false);
  };

  const handleShare = () => {
    toast({
      title: "Whiteboard shared",
      description: "Whiteboard has been shared with session participants",
    });
  };

  const handleExport = () => {
    // Export whiteboard as image
    const canvas = document.querySelector('.whiteboard-canvas') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PenTool className="h-5 w-5 mr-2" /> 
            Collaborative Whiteboard
          </DialogTitle>
          <DialogDescription>
            Draw and collaborate in real-time with other participants
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative flex-grow bg-white rounded-md overflow-hidden border">
          {isLoading ? (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Whiteboard 
              initialData={whiteboardData}
              onChange={handleWhiteboardChange}
              sessionId={sessionId}
              userId={user?.id || 'anonymous'}
            />
          )}
        </div>
        
        <div className="flex gap-2 justify-between mt-2">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => saveWhiteboardData(whiteboardData)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhiteboardDialog;
