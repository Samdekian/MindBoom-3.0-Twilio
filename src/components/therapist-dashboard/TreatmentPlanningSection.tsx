
import React from 'react';
import TreatmentPlanningWidget from './TreatmentPlanningWidget';

const TreatmentPlanningSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Treatment Planning</h2>
        <p className="text-gray-600 mt-1">
          Create and manage treatment plans for your patients
        </p>
      </div>
      
      <TreatmentPlanningWidget />
    </div>
  );
};

export default TreatmentPlanningSection;
