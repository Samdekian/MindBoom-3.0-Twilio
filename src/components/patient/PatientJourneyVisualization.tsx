
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { MessageSquare, Calendar, Heart, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientJourneyVisualization = () => {
  const { patientInquiries, relationships } = usePatientInquiries();
  const navigate = useNavigate();

  const currentRelationship = relationships[0]; // Most recent relationship
  const latestInquiry = patientInquiries[0]; // Most recent inquiry

  const journeySteps = [
    {
      id: "inquiry",
      title: "Initial Inquiry",
      description: "Share your concerns and goals",
      icon: MessageSquare,
      status: patientInquiries.length > 0 ? "completed" : "pending",
      color: "blue"
    },
    {
      id: "response",
      title: "Therapist Response",
      description: "Receive response and next steps",
      icon: Clock,
      status: latestInquiry?.status === "responded" ? "completed" : 
             latestInquiry?.status === "pending" ? "in_progress" : "pending",
      color: "purple"
    },
    {
      id: "consultation",
      title: "Initial Consultation",
      description: "Meet your therapist and discuss treatment",
      icon: Calendar,
      status: currentRelationship?.relationship_status === "consultation_scheduled" || 
             currentRelationship?.relationship_status === "active" ? "completed" : 
             latestInquiry?.status === "responded" ? "available" : "pending",
      color: "orange"
    },
    {
      id: "therapy",
      title: "Active Therapy",
      description: "Begin your therapeutic journey",
      icon: Heart,
      status: currentRelationship?.relationship_status === "active" ? "in_progress" : "pending",
      color: "green"
    }
  ];

  const getStepStatus = (step: any) => {
    switch (step.status) {
      case "completed":
        return { icon: CheckCircle, color: "text-green-600 bg-green-100", progress: 100 };
      case "in_progress":
        return { icon: step.icon, color: `text-${step.color}-600 bg-${step.color}-100`, progress: 50 };
      case "available":
        return { icon: step.icon, color: `text-${step.color}-600 bg-${step.color}-100`, progress: 0 };
      case "pending":
      default:
        return { icon: step.icon, color: "text-gray-400 bg-gray-100", progress: 0 };
    }
  };

  const getOverallProgress = () => {
    const completedSteps = journeySteps.filter(step => step.status === "completed").length;
    const inProgressSteps = journeySteps.filter(step => step.status === "in_progress").length;
    return ((completedSteps + inProgressSteps * 0.5) / journeySteps.length) * 100;
  };

  const getNextStepRecommendation = () => {
    if (!latestInquiry) {
      return {
        title: "Start Your Journey",
        description: "Send an inquiry to a therapist to begin your therapeutic journey.",
        action: "Find a Therapist",
        link: "/book-therapist"
      };
    }
    
    if (latestInquiry.status === "pending") {
      return {
        title: "Waiting for Response",
        description: "Your therapist will respond to your inquiry within 24 hours.",
        action: "View My Inquiries",
        link: "/patient/inquiries"
      };
    }
    
    if (latestInquiry.status === "responded" && currentRelationship?.relationship_status === "consultation_scheduled") {
      return {
        title: "Schedule Your Consultation",
        description: "Book your initial consultation to meet with your therapist.",
        action: "Schedule Now",
        link: "/calendar"
      };
    }
    
    if (currentRelationship?.relationship_status === "active") {
      return {
        title: "Continue Your Progress",
        description: "Keep up with your sessions and track your therapeutic progress.",
        action: "View Progress",
        link: "/session-history"
      };
    }
    
    return {
      title: "Next Steps Available",
      description: "Check your inquiries for the next steps in your journey.",
      action: "View Inquiries",
      link: "/patient/inquiries"
    };
  };

  const nextStep = getNextStepRecommendation();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Your Therapeutic Journey
          </CardTitle>
          <CardDescription>
            Track your progress from initial inquiry to active therapy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(getOverallProgress())}% Complete</span>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Journey Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Steps</CardTitle>
          <CardDescription>
            Follow these steps to begin and continue your therapeutic journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {journeySteps.map((step, index) => {
              const stepStatus = getStepStatus(step);
              const StepIcon = stepStatus.icon;
              
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stepStatus.color}`}>
                    <StepIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <Badge 
                        variant={step.status === "completed" ? "default" : 
                                step.status === "in_progress" ? "secondary" :
                                step.status === "available" ? "outline" : "outline"}
                        className={step.status === "completed" ? "bg-green-600" : ""}
                      >
                        {step.status === "completed" ? "Complete" :
                         step.status === "in_progress" ? "In Progress" :
                         step.status === "available" ? "Available" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {step.status !== "pending" && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step.status === "completed" ? "bg-green-600" : `bg-${step.color}-600`
                          }`}
                          style={{ width: `${stepStatus.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  {index < journeySteps.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 ml-6 mt-4"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Recommendation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Recommended Next Step</CardTitle>
          <CardDescription className="text-blue-700">
            {nextStep.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">{nextStep.description}</p>
          <Button 
            onClick={() => navigate(nextStep.link)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {nextStep.action}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Current Status Summary */}
      {currentRelationship && (
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Relationship Status</label>
                <p className="text-lg font-medium capitalize">
                  {currentRelationship.relationship_status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Started</label>
                <p className="text-lg font-medium">
                  {new Date(currentRelationship.created_at).toLocaleDateString()}
                </p>
              </div>
              {currentRelationship.relationship_notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-sm text-gray-700 mt-1 p-3 bg-white rounded border">
                    {currentRelationship.relationship_notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientJourneyVisualization;
