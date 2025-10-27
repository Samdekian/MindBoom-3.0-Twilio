
export function calculateQualityScore({
  roundTripTime,
  packetLoss,
  frameWidth,
  frameHeight,
  framesPerSecond
}: {
  roundTripTime: number | null;
  packetLoss: number | null;
  frameWidth: number | null;
  frameHeight: number | null;
  framesPerSecond: number | null;
}): number {
  // Start with perfect quality
  let qualityScore = 100;
  
  // Reduce score based on RTT
  if (roundTripTime !== null) {
    if (roundTripTime > 300) qualityScore -= 30;
    else if (roundTripTime > 150) qualityScore -= 15;
    else if (roundTripTime > 100) qualityScore -= 5;
  }
  
  // Reduce score based on packet loss
  if (packetLoss !== null) {
    if (packetLoss > 5) qualityScore -= 40;
    else if (packetLoss > 2) qualityScore -= 20;
    else if (packetLoss > 0.5) qualityScore -= 10;
  }
  
  // Reduce score based on resolution
  if (frameWidth !== null && frameHeight !== null) {
    const pixels = frameWidth * frameHeight;
    if (pixels < 307200) qualityScore -= 10; // Less than 640x480
  }
  
  // Reduce score based on framerate
  if (framesPerSecond !== null) {
    if (framesPerSecond < 15) qualityScore -= 15;
    else if (framesPerSecond < 24) qualityScore -= 5;
  }
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, qualityScore));
}
