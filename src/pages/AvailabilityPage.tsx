
import React from "react";
import { Helmet } from "react-helmet-async";
import AvailabilityManager from "@/components/availability/AvailabilityManager";

const AvailabilityPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Availability Management | Therapy Platform</title>
      </Helmet>
      <AvailabilityManager />
    </div>
  );
};

export default AvailabilityPage;
