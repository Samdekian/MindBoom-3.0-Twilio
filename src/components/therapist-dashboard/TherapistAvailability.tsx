
import React from 'react';
import AvailabilityWidget from './AvailabilityWidget';

const TherapistAvailability: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Availability Management</h2>
        <p className="text-gray-600 mt-1">
          Manage your schedule and set your availability for appointments
        </p>
      </div>
      
      <AvailabilityWidget />
    </div>
  );
};

export default TherapistAvailability;
