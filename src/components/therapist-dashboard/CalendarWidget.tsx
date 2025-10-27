
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CalendarWidget = () => {
  const navigate = useNavigate();
  
  // Get current date and week days
  const today = new Date();
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i + 1); // Start from Monday
    return date;
  });

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-blue-600" />
            This Week's Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/calendar')}
            >
              View Calendar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Integration Status */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">Calendar Sync Active</span>
            </div>
            <Badge variant="outline" className="text-xs">Google Calendar</Badge>
          </div>
        </div>

        {/* Week Overview */}
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {currentWeek.map((date, index) => (
              <div key={date.toISOString()} className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${
                  date.toDateString() === today.toDateString() 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100'
                }`}>
                  {date.getDate()}
                </div>
                {/* Session indicators - mock data for weekdays */}
                {index < 5 && (
                  <div className="mt-1 flex justify-center">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Calendar Actions */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Availability
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
