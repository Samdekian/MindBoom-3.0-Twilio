import { useState, useEffect } from "react";

// Enhanced connection metrics interface
export interface ConnectionMetrics {
  packetLoss: number;
  jitter: number;
  rtt: number;
  bytesSent: number;
  bytesReceived: number;
  framerate: number;
  resolution: {
    width: number;
    height: number;
  };
  // Add the missing properties
  prevBytesReceived: number; 
  prevTimestamp: number;
  prevBytesSent: number;
  prevTimestampSent: number;
}

export function useConnectionMonitoring(peerConnection: RTCPeerConnection | null) {
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    packetLoss: 0,
    jitter: 0,
    rtt: 0,
    bytesSent: 0,
    bytesReceived: 0,
    framerate: 0,
    resolution: { width: 0, height: 0 },
    prevBytesReceived: 0,
    prevTimestamp: 0,
    prevBytesSent: 0,
    prevTimestampSent: 0
  });
  
  useEffect(() => {
    if (!peerConnection) return;
    
    const updateMetrics = async () => {
      try {
        const stats = await peerConnection.getStats(null);
        let inboundRtpReport: RTCInboundRtpStreamStats | undefined;
        let outboundRtpReport: RTCOutboundRtpStreamStats | undefined;
        let candidatePairReport: RTCIceCandidatePairStats | undefined;
        
        stats.forEach(report => {
          if (report.type === "inbound-rtp" && report.kind === "video") {
            inboundRtpReport = report;
          } else if (report.type === "outbound-rtp" && report.kind === "video") {
            outboundRtpReport = report;
          } else if (report.type === "candidate-pair" && report.state === "succeeded") {
            candidatePairReport = report;
          }
        });
        
        if (inboundRtpReport && candidatePairReport) {
          const {
            packetsLost,
            packetsReceived,
            jitter,
            bytesReceived,
            framesDecoded,
            frameWidth,
            frameHeight
          } = inboundRtpReport;
          
          const { currentRoundTripTime } = candidatePairReport;
          
          const packetLoss = packetsReceived ? packetsLost / packetsReceived : 0;
          const rtt = currentRoundTripTime || 0;
          
          setMetrics(prev => ({
            ...prev,
            packetLoss,
            jitter,
            rtt,
            bytesReceived,
            framerate: framesDecoded,
            resolution: { width: frameWidth, height: frameHeight },
            prevBytesReceived: prev.bytesReceived,
            prevTimestamp: prev.prevTimestamp
          }));
        }
        
        if (outboundRtpReport && candidatePairReport) {
          const { bytesSent } = outboundRtpReport;
          
          setMetrics(prev => ({
            ...prev,
            bytesSent,
            prevBytesSent: prev.bytesSent,
            prevTimestampSent: prev.prevTimestampSent
          }));
        }
      } catch (error) {
        console.error("Error getting connection stats:", error);
      }
    };
    
    const intervalId = setInterval(updateMetrics, 2000);
    
    return () => clearInterval(intervalId);
  }, [peerConnection]);
  
  return { metrics };
}
