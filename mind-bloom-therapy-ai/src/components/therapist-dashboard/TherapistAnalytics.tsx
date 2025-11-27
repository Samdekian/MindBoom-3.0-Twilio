
import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

const TherapistAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="text-gray-600 mt-1">
          View detailed insights about your practice and patient progress
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
};

export default TherapistAnalytics;
