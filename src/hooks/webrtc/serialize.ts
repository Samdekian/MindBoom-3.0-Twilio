
/**
 * Serialization utilities for WebRTC signaling messages
 */

export function serializeSessionDesc(desc: RTCSessionDescription): any {
  return {
    type: desc.type,
    sdp: desc.sdp
  };
}

export function deserializeSessionDesc(data: any): RTCSessionDescription {
  return new RTCSessionDescription({
    type: data.type,
    sdp: data.sdp
  });
}

export function serializeIceCandidate(candidate: RTCIceCandidate): any {
  return {
    candidate: candidate.candidate,
    sdpMLineIndex: candidate.sdpMLineIndex,
    sdpMid: candidate.sdpMid
  };
}

export function deserializeIceCandidate(data: any): RTCIceCandidateInit {
  return {
    candidate: data.candidate,
    sdpMLineIndex: data.sdpMLineIndex,
    sdpMid: data.sdpMid
  };
}
