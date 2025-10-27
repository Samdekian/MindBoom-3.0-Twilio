
import React from 'react';
import AppointmentForm from '../AppointmentForm';

interface AppointmentEditFormProps {
  startTime: Date;
  onSuccess: () => void;
  onCancel: () => void;
  timeZone?: string;
  appointment?: any;
  isEditing?: boolean;
}

const AppointmentEditForm: React.FC<AppointmentEditFormProps> = (props) => {
  return <AppointmentForm {...props} />;
};

export default AppointmentEditForm;
