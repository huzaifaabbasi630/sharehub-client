const peerConnections = new Map();
const localStreams = new Map();

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const createPeerConnection = (peerId, onTrack, onIceCandidate) => {
  const pc = new RTCPeerConnection(ICE_SERVERS);
  
  pc.ontrack = (event) => {
    onTrack(peerId, event.streams[0]);
  };
  
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(peerId, event.candidate);
    }
  };
  
  pc.onconnectionstatechange = () => {
    console.log(`Connection state with ${peerId}:`, pc.connectionState);
  };
  
  peerConnections.set(peerId, pc);
  return pc;
};

export const getPeerConnection = (peerId) => {
  return peerConnections.get(peerId);
};

export const closePeerConnection = (peerId) => {
  const pc = peerConnections.get(peerId);
  if (pc) {
    pc.close();
    peerConnections.delete(peerId);
  }
};

export const closeAllPeerConnections = () => {
  peerConnections.forEach((pc, peerId) => {
    pc.close();
  });
  peerConnections.clear();
};

export const addLocalStream = (stream) => {
  peerConnections.forEach((pc) => {
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
  });
};

export const removeLocalStream = () => {
  localStreams.forEach((stream) => {
    stream.getTracks().forEach(track => track.stop());
  });
  localStreams.clear();
};

export const createOffer = async (peerId) => {
  const pc = peerConnections.get(peerId);
  if (!pc) return null;
  
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
};

export const createAnswer = async (peerId, offer) => {
  const pc = peerConnections.get(peerId);
  if (!pc) return null;
  
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
};

export const handleAnswer = async (peerId, answer) => {
  const pc = peerConnections.get(peerId);
  if (pc) {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }
};

export const handleIceCandidate = async (peerId, candidate) => {
  const pc = peerConnections.get(peerId);
  if (pc) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
};

export const getLocalStream = async (video = true, audio = true) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
    localStreams.set('local', stream);
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

export const getScreenShareStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    return stream;
  } catch (error) {
    console.error('Error accessing screen share:', error);
    throw error;
  }
};

export const toggleAudio = (enabled) => {
  const stream = localStreams.get('local');
  if (stream) {
    stream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

export const toggleVideo = (enabled) => {
  const stream = localStreams.get('local');
  if (stream) {
    stream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};
