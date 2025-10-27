
// Basic WebRTC stats hook for compatibility
export const useWebRTCStats = () => {
  return {
    stats: null,
    refreshStats: async () => {}
  };
};
