
import React from 'react';

interface AppointmentReminderEmailProps {
  recipientName: string;
  appointmentDate: string;
  appointmentTime: string;
  therapistName: string;
  videoLink?: string;
}

export const AppointmentReminderEmail: React.FC<AppointmentReminderEmailProps> = ({
  recipientName,
  appointmentDate,
  appointmentTime,
  therapistName,
  videoLink,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5;">Appointment Reminder</h1>
      <p>Hello ${recipientName},</p>
      <p>This is a friendly reminder about your upcoming therapy session:</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Therapist:</strong> ${therapistName}</p>
        ${videoLink ? `<p><strong>Video Link:</strong> <a href="${videoLink}" style="color: #4f46e5;">Join Session</a></p>` : ''}
      </div>
      
      <p>If you need to reschedule, please do so at least 24 hours in advance.</p>
      <p>We look forward to seeing you!</p>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  `;
};

export default AppointmentReminderEmail;
