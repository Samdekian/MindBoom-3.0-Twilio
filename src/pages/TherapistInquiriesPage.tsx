
import React from "react";
import { Helmet } from "react-helmet-async";
import TherapistInquiryInbox from "@/components/inquiries/TherapistInquiryInbox";

const TherapistInquiriesPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Patient Inquiries | Therapy Platform</title>
      </Helmet>
      <TherapistInquiryInbox />
    </div>
  );
};

export default TherapistInquiriesPage;
