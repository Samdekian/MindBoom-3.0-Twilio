
/**
 * SDP transformation utilities to optimize WebRTC connections
 * These functions help improve connection quality and compatibility
 */

// Force H.264 video codec for better compatibility across browsers
export const preferH264 = (sdp: string): string => {
  // If no video present, return as is
  if (sdp.indexOf('m=video') === -1) {
    return sdp;
  }

  // Split SDP into lines
  const lines = sdp.split('\r\n');
  const mLineIndex = lines.findIndex(line => line.startsWith('m=video'));
  
  if (mLineIndex === -1) {
    return sdp;
  }
  
  // Find all payload types (PT values)
  const videoMLine = lines[mLineIndex];
  const pattern = /\d+ H264\/90000/g;
  
  // Search for H.264 in the SDP
  let h264PayloadTypes: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(' H264/90000')) {
      const pt = lines[i].split(' ')[0].split(':')[1];
      h264PayloadTypes.push(pt);
    }
  }
  
  if (h264PayloadTypes.length === 0) {
    // No H.264 codec found
    return sdp;
  }
  
  // Reorder video payload types in m= line to prefer H.264
  const parts = videoMLine.split(' ');
  const payloadTypes = parts.slice(3);
  
  // Filter out H.264 payload types
  const newPayloadTypes = h264PayloadTypes.concat(
    payloadTypes.filter(pt => !h264PayloadTypes.includes(pt))
  );
  
  // Reconstruct m= line
  parts.splice(3, payloadTypes.length, ...newPayloadTypes);
  lines[mLineIndex] = parts.join(' ');
  
  return lines.join('\r\n');
};

// Set maximum bitrate for video to ensure better performance on limited connections
export const setMaxBitrate = (sdp: string, bitrate: number): string => {
  const lines = sdp.split('\r\n');
  const videoIndex = lines.findIndex(line => line.startsWith('m=video'));
  
  if (videoIndex === -1) {
    return sdp;
  }
  
  // Find the first "a=ssrc:" line after the m=video line
  let ssrcLineIndex = -1;
  for (let i = videoIndex; i < lines.length; i++) {
    if (lines[i].startsWith('a=ssrc:') || lines[i].startsWith('m=audio')) {
      ssrcLineIndex = i;
      break;
    }
  }
  
  if (ssrcLineIndex === -1) {
    return sdp;
  }
  
  // Insert b=AS: line right before the first SSRC line
  const bitrateKbps = Math.floor(bitrate / 1000);
  lines.splice(ssrcLineIndex, 0, `b=AS:${bitrateKbps}`);
  
  return lines.join('\r\n');
};

// Optimize SDP for reduced latency
export const optimizeForLatency = (sdp: string): string => {
  // Set Google's transport-cc extension for better congestion control
  let optimizedSdp = sdp.replace(
    /a=rtcp-fb:* transport-cc/g, 
    'a=rtcp-fb:* transport-cc'
  );
  
  // Enable NACK for better packet loss recovery
  optimizedSdp = optimizedSdp.replace(
    /a=rtcp-fb:* nack/g, 
    'a=rtcp-fb:* nack'
  );
  
  // Add Google's minimum bitrate hint
  optimizedSdp = optimizedSdp.replace(
    /a=fmtp:([0-9]+)/g, 
    'a=fmtp:$1;x-google-min-bitrate=300'
  );
  
  return optimizedSdp;
};

// Process SDP with all optimizations
export const processSDPForOptimalQuality = (
  sdp: string, 
  options = { 
    preferH264: true, 
    maxBitrate: 1500000, 
    optimizeLatency: true 
  }
): string => {
  let processedSdp = sdp;
  
  if (options.preferH264) {
    processedSdp = preferH264(processedSdp);
  }
  
  if (options.maxBitrate) {
    processedSdp = setMaxBitrate(processedSdp, options.maxBitrate);
  }
  
  if (options.optimizeLatency) {
    processedSdp = optimizeForLatency(processedSdp);
  }
  
  return processedSdp;
};
