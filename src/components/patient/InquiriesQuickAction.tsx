
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";

const InquiriesQuickAction = () => {
  const navigate = useNavigate();
  const { patientInquiries } = usePatientInquiries();
  
  const respondedInquiries = patientInquiries.filter(i => i.status === 'responded').length;
  const hasUnreadResponses = respondedInquiries > 0;

  return (
    <div className="relative">
      <Button
        onClick={() => navigate("/patient/inquiries")}
        className="w-full h-24 flex flex-col gap-2 bg-purple-500 hover:bg-purple-600 text-white"
      >
        <MessageSquare className="h-6 w-6" />
        <span>My Inquiries</span>
      </Button>
      {hasUnreadResponses && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {respondedInquiries}
        </Badge>
      )}
    </div>
  );
};

export default InquiriesQuickAction;
