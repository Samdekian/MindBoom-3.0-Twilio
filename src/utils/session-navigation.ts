
export const getSessionUrl = (appointmentId: string): string => {
  return `/session/${appointmentId}`;
};

export const getSessionStatus = (startTime: string, endTime: string): 'scheduled' | 'ready' | 'soon' | 'active' | 'ended' => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // 15 minutes before start time
  const readyTime = new Date(start.getTime() - 15 * 60 * 1000);
  
  if (now < readyTime) {
    return 'scheduled';
  } else if (now >= readyTime && now < start) {
    return 'ready';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'ended';
  }
};

export const canJoinSession = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Allow joining 15 minutes before start time until session ends
  const readyTime = new Date(start.getTime() - 15 * 60 * 1000);
  
  return now >= readyTime && now <= end;
};
