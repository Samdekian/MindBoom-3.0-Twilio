
import { 
  ConnectionMetricsWithHistory,
  RTCOutboundRtpStreamStats,
  RTCInboundRtpStreamStats,
  RTCRemoteInboundRtpStreamStats
} from "../types/history-metrics";

export function collectMetricsFromStats(
  stats: RTCStatsReport,
  peerConnection: RTCPeerConnection,
  prevBytesSent: number,
  prevBytesReceived: number,
  prevTimestamp: number
): {
  metrics: Omit<ConnectionMetricsWithHistory, "timestamp">;
  bytesSent: number;
  bytesReceived: number;
} {
  const now = Date.now();
  
  let packetLoss = 0;
  let jitter = 0;
  let rtt = 0;
  let frameWidth = 0;
  let frameHeight = 0;
  let frameRate = 0;
  let bytesSent = 0;
  let bytesReceived = 0;
  
  stats.forEach((report) => {
    if (report.type === 'outbound-rtp' && 'kind' in report && report.kind === 'video') {
      const outboundReport = report as RTCOutboundRtpStreamStats;
      if (outboundReport.bytesSent !== undefined) {
        bytesSent = outboundReport.bytesSent;
      }
      
      // Get resolution and frame rate from outbound video
      if ('frameWidth' in outboundReport && outboundReport.frameWidth && 
          'frameHeight' in outboundReport && outboundReport.frameHeight) {
        frameWidth = outboundReport.frameWidth;
        frameHeight = outboundReport.frameHeight;
      }
      
      if ('framesPerSecond' in outboundReport && outboundReport.framesPerSecond) {
        frameRate = outboundReport.framesPerSecond;
      }
    }
    
    if (report.type === 'inbound-rtp' && 'kind' in report && report.kind === 'video') {
      const inboundReport = report as RTCInboundRtpStreamStats;
      
      if (inboundReport.packetsLost !== undefined && inboundReport.packetsReceived !== undefined) {
        const totalPackets = inboundReport.packetsReceived + inboundReport.packetsLost;
        packetLoss = totalPackets > 0 ? inboundReport.packetsLost / totalPackets : 0;
      }
      
      if (inboundReport.jitter !== undefined) {
        jitter = inboundReport.jitter * 1000; // Convert to ms
      }
      
      if (inboundReport.bytesReceived !== undefined) {
        bytesReceived = inboundReport.bytesReceived;
      }
      
      // Get resolution from inbound if outbound didn't have it
      if (frameWidth === 0 && 
          'frameWidth' in inboundReport && inboundReport.frameWidth && 
          'frameHeight' in inboundReport && inboundReport.frameHeight) {
        frameWidth = inboundReport.frameWidth;
        frameHeight = inboundReport.frameHeight;
      }
      
      if (frameRate === 0 && 'framesPerSecond' in inboundReport && inboundReport.framesPerSecond) {
        frameRate = inboundReport.framesPerSecond;
      }
    }
    
    if (report.type === 'remote-inbound-rtp') {
      const remoteInboundReport = report as RTCRemoteInboundRtpStreamStats;
      if (remoteInboundReport.roundTripTime !== undefined) {
        rtt = remoteInboundReport.roundTripTime * 1000; // Convert to ms
      }
    }
  });
  
  // Calculate bandwidth
  const timeDiff = (now - prevTimestamp) / 1000; // seconds
  
  let sendBandwidth = 0;
  let receiveBandwidth = 0;
  
  if (prevTimestamp > 0 && timeDiff > 0) {
    sendBandwidth = (bytesSent - prevBytesSent) * 8 / timeDiff / 1000; // kbps
    receiveBandwidth = (bytesReceived - prevBytesReceived) * 8 / timeDiff / 1000; // kbps
  }
  
  return {
    metrics: {
      packetLoss,
      jitter,
      roundTripTime: rtt,
      bandwidth: {
        send: sendBandwidth,
        receive: receiveBandwidth
      },
      resolution: {
        width: frameWidth,
        height: frameHeight
      },
      frameRate,
      iceState: peerConnection.iceConnectionState
    },
    bytesSent,
    bytesReceived
  };
}

export function calculateAverageMetrics(
  metricsHistory: ConnectionMetricsWithHistory[],
  currentTime: number,
  seconds: number
): ConnectionMetricsWithHistory {
  const cutoff = currentTime - seconds * 1000;
  
  // Filter history for the requested time period
  const relevantHistory = metricsHistory.filter(m => m.timestamp >= cutoff);
  
  if (relevantHistory.length === 0) {
    // Return empty metrics if no history data
    return {
      timestamp: currentTime,
      packetLoss: 0,
      jitter: 0,
      roundTripTime: 0,
      bandwidth: {
        send: 0,
        receive: 0
      },
      resolution: {
        width: 0,
        height: 0
      },
      frameRate: 0,
      iceState: "new"
    };
  }
  
  // Calculate averages
  const sum = relevantHistory.reduce(
    (acc, curr) => {
      return {
        packetLoss: acc.packetLoss + curr.packetLoss,
        jitter: acc.jitter + curr.jitter,
        roundTripTime: acc.roundTripTime + curr.roundTripTime,
        bandwidthSend: acc.bandwidthSend + curr.bandwidth.send,
        bandwidthReceive: acc.bandwidthReceive + curr.bandwidth.receive,
        frameRate: acc.frameRate + curr.frameRate
      };
    },
    { 
      packetLoss: 0, 
      jitter: 0, 
      roundTripTime: 0, 
      bandwidthSend: 0, 
      bandwidthReceive: 0,
      frameRate: 0
    }
  );
  
  const count = relevantHistory.length;
  
  // Get the most recent resolution and ICE state
  const latest = relevantHistory[relevantHistory.length - 1];
  
  return {
    timestamp: currentTime,
    packetLoss: sum.packetLoss / count,
    jitter: sum.jitter / count,
    roundTripTime: sum.roundTripTime / count,
    bandwidth: {
      send: sum.bandwidthSend / count,
      receive: sum.bandwidthReceive / count
    },
    resolution: latest.resolution,
    frameRate: sum.frameRate / count,
    iceState: latest.iceState
  };
}
