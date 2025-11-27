
import React from 'react';
import CalendarView from '../components/calendar/CalendarView';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRBAC } from '@/hooks/useRBAC';
import RoleBasedNavLink from '@/components/RoleBasedNavLink';

/**
 * Calendar Page
 * 
 * A responsive calendar view that adapts based on the user's role:
 * - For therapists: Shows their availability and appointments with patients
 * - For patients: Shows their scheduled appointments and allows booking new ones
 * 
 * The UI adjusts accordingly with different action buttons and views.
 */
const Calendar = () => {
  const { hasRole } = useRBAC();
  const isTherapist = hasRole('therapist');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Calendar</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {isTherapist ? 'Your Schedule & Availability' : 'Your Appointments'}
        </h1>
        <div className="space-x-2 flex">
          {isTherapist ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/therapist?tab=availability">
                <Settings className="h-4 w-4 mr-2" />
                Manage Availability
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/book-therapist">
                <PlusCircle className="h-4 w-4 mr-2" />
                Book Session
              </Link>
            </Button>
          )}
          
          <Button variant="outline" size="sm" asChild>
            <Link to="/calendar-settings">
              <Settings className="h-4 w-4 mr-2" />
              Calendar Settings
            </Link>
          </Button>
        </div>
      </div>
      
      <CalendarView />
    </div>
  );
};

export default Calendar;
