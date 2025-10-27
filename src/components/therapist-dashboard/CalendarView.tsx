
import React from 'react';
import CalendarWidget from './CalendarWidget';

const CalendarView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        <p className="text-gray-600 mt-1">
          View and manage your appointments and schedule
        </p>
      </div>
      
      <CalendarWidget />
    </div>
  );
};

export default CalendarView;
