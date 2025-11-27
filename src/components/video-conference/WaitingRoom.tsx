
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WaitingRoomProps {
  isPatient: boolean;
  isTherapist: boolean;
  admitFromWaitingRoom: () => void;
  duration?: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  isPatient,
  isTherapist,
  admitFromWaitingRoom,
  duration = 0
}) => {
  const { toast } = useToast();
  const [waitingTime, setWaitingTime] = useState(0);
  const [notifications, setNotifications] = useState(0);
  
  // Format waiting time in minutes and seconds
  const formatWaitingTime = () => {
    const minutes = Math.floor(waitingTime / 60);
    const seconds = waitingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // For patient: track waiting time
  useEffect(() => {
    let interval: number | null = null;
    
    if (isPatient) {
      interval = window.setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isPatient]);
  
  // For therapist: show notification after patient has been waiting
  useEffect(() => {
    if (isTherapist && waitingTime > 0 && waitingTime % 30 === 0 && notifications < 3) {
      toast({
        title: "Patient Waiting",
        description: `A patient has been waiting for ${Math.floor(waitingTime / 60)} minutes`,
        variant: "default",
      });
      setNotifications(prev => prev + 1);
    }
  }, [waitingTime, isTherapist, toast, notifications]);

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="text-center p-6 max-w-md w-full">
        {isPatient ? (
          <>
            <div className="mb-6 flex justify-center">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-amber-500/20 text-amber-500">
                Waiting Room
              </Badge>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Waiting for your therapist</h3>
            <p className="text-muted-foreground mb-6">
              Your therapist will admit you to the session shortly.
            </p>
            <div className="text-sm text-muted-foreground">
              Waiting time: {formatWaitingTime()}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-500/20 text-blue-500">
                Patient Waiting
              </Badge>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Patient is waiting</h3>
            <p className="text-muted-foreground mb-6">
              Your patient is in the waiting room and ready for the session.
            </p>
            <Button onClick={admitFromWaitingRoom} className="w-full mb-2">
              <Video className="mr-2 h-4 w-4" />
              Admit Patient
            </Button>
            <div className="text-sm text-muted-foreground">
              Patient waiting for: {formatWaitingTime()}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default WaitingRoom;
