
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Video, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleAppointmentModal from "@/components/booking/ScheduleAppointmentModal";

const QuickActions = () => {
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const actions = [
    {
      id: 'book',
      label: 'Book Consultation',
      icon: BookOpen,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => setShowBookingModal(true)
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/calendar')
    },
    {
      id: 'video',
      label: 'Video Session',
      icon: Video,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/video-session/current')
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => navigate('/messages')
    }
  ];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {actions.map(({ id, label, icon: Icon, color, onClick }) => (
              <Button
                key={id}
                onClick={onClick}
                className={`${color} text-white p-4 md:p-6 h-auto min-h-[100px] md:min-h-[120px] flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 hover:shadow-lg`}
              >
                <Icon className="h-7 w-7 md:h-8 md:w-8" />
                <span className="text-sm md:text-base font-medium text-center leading-tight">
                  {label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScheduleAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};

export default QuickActions;
