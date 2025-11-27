import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, FileText, MessageSquare, Phone, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface PatientCardProps {
  patient: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    status: string;
    created_at: string;
    assignment: {
      id: string;
      start_date: string;
      status: string;
      priority_level: string;
      assignment_reason?: string;
    };
    lastSessionDate?: string;
    upcomingSessionDate?: string;
    totalSessions: number;
  };
  onSchedule?: (patientId: string) => void;
  onViewProfile?: (patientId: string) => void;
  onSendMessage?: (patientId: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onSchedule,
  onViewProfile,
  onSendMessage,
}) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: "destructive",
      high: "secondary",
      medium: "outline",
      low: "default",
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const daysSinceLastSession = patient.lastSessionDate 
    ? Math.floor((Date.now() - new Date(patient.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Patient Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(patient.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-none">
                {patient.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">{patient.email}</p>
              {patient.phone_number && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {patient.phone_number}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(patient.status)}
                {getPriorityBadge(patient.assignment.priority_level)}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (onViewProfile) {
                  onViewProfile(patient.id);
                } else {
                  navigate(`/therapist/patient/${patient.id}`);
                }
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              Profile
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                if (onSchedule) {
                  onSchedule(patient.id);
                } else {
                  navigate(`/therapist/schedule?patient=${patient.id}`);
                }
              }}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Assigned</div>
            <div className="font-medium">
              {format(new Date(patient.assignment.start_date), "MMM d, yyyy")}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Sessions</div>
            <div className="font-medium flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {patient.totalSessions}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Last Session</div>
            <div className="font-medium">
              {patient.lastSessionDate ? (
                <div>
                  <div>{format(new Date(patient.lastSessionDate), "MMM d")}</div>
                  {daysSinceLastSession && (
                    <div className="text-xs text-muted-foreground">
                      {daysSinceLastSession} days ago
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Next Session</div>
            <div className="font-medium">
              {patient.upcomingSessionDate ? (
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  {format(new Date(patient.upcomingSessionDate), "MMM d")}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Assignment Reason */}
        {patient.assignment.assignment_reason && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Assignment Reason
            </div>
            <div className="text-sm">{patient.assignment.assignment_reason}</div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onSendMessage?.(patient.id)}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;