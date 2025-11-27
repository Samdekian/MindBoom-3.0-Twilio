
import React from "react";
import { Helmet } from "react-helmet-async";
import TherapistAnalyticsDashboard from "@/components/analytics/TherapistAnalyticsDashboard";

const TherapistAnalyticsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Analytics Dashboard | Therapy Platform</title>
      </Helmet>
      <TherapistAnalyticsDashboard />
    </div>
  );
};

export default TherapistAnalyticsPage;
