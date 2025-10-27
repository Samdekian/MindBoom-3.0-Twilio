
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
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(({ id, label, icon: Icon, color, onClick }) => (
              <Button
                key={id}
                onClick={onClick}
                className={`${color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
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
