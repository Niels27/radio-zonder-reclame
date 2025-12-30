// Replace the entire file with this improved version:

const LOFI_STREAMS = [
  {
    name: "Lofi Girl - Study Stream",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    type: "youtube_video"
  },
  {
    name: "Lofi Girl - Sleep Stream", 
    url: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
    type: "youtube_video"
  },
  {
    name: "ChilledCow Alternative",
    url: "https://www.youtube.com/watch?v=5yx6BWlEVcY",
    type: "youtube_video"
  },
  {
    name: "Lofi Hip Hop Cafe",
    url: "https://www.youtube.com/watch?v=kgx4WGK0oNU",
    type: "youtube_video"
  },
  {
    name: "Lofi Hip Hop Radio",
    url: "https://streams.ilovemusic.de/iloveradio17.mp3",
    type: "radio_stream"
  }
];

let currentLofiIndex = 0;
let failedStreams = new Set();

// ✅ DEPRECATED: Old volume sync code removed - now managed by ResizableYouTubePlayer

export const getNextLofiStream = () => {
  // Check for custom lofi URL first
  try {
    const customUrl = localStorage.getItem('custom_lofi_url');
    if (customUrl && customUrl.trim()) {
      return {
        name: "Custom Lofi Stream",
        url: customUrl.trim(),
        type: "youtube_video"
      };
    }
  } catch (error) {
    console.warn('Failed to get custom lofi URL:', error);
  }
  // Fall back to default streams
  let attempts = 0;
  let stream = null;
  
  while (attempts < LOFI_STREAMS.length) {
    stream = LOFI_STREAMS[currentLofiIndex];
    currentLofiIndex = (currentLofiIndex + 1) % LOFI_STREAMS.length;
    
    if (!failedStreams.has(stream.url) || attempts === LOFI_STREAMS.length - 1) {
      break;
    }
    
    attempts++;
  }
  
  return stream;
};

export const markLofiStreamAsFailed = (streamUrl) => {
  console.log(`🚫 Marking lofi stream as failed: ${streamUrl}`);
  failedStreams.add(streamUrl);
  
  if (failedStreams.size >= LOFI_STREAMS.length * 0.8) {
    console.log('🔄 Too many failed lofi streams, resetting failed list');
    failedStreams.clear();
  }
};

export const resetLofiIndex = () => {
  currentLofiIndex = 0;
  failedStreams.clear();
};

export const extractYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// ✅ DEPRECATED: Old overlay code removed - now using ResizableYouTubePlayer component
// Lofi mode now uses window.openYouTubePlayer() like playlists for consistency

export const createLofiStation = (lofiStream) => {
  if (lofiStream.type === "youtube_video") {
    const videoId = extractYouTubeVideoId(lofiStream.url);
    return {
      name: lofiStream.name,
      url: lofiStream.url,
      videoId: videoId,
      logo: "https://yt3.googleusercontent.com/2P1boQ36hnemu2BDsvQEOJE-HLHOJr6w2zEWC5wTnlpqSxzMWiFC5Tb2lPUGpb0vG6Z3_gWU=s176-c-k-c0x00ffffff-no-rj",
      description: "Lofi hip hop beats to relax/study to",
      type: "lofi",
      isLofi: true
    };
  } else {
    return {
      name: lofiStream.name,
      url: lofiStream.url,
      logo: "https://yt3.googleusercontent.com/2P1boQ36hnemu2BDsvQEOJE-HLHOJr6w2zEWC5wTnlpqSxzMWiFC5Tb2lPUGpb0vG6Z3_gWU=s176-c-k-c0x00ffffff-no-rj",
      description: "Lofi hip hop radio stream",
      type: "lofi",
      isLofi: true
    };
  }
};

// ✅ DEPRECATED: Old cross-fade and overlay management code removed
// Now managed by ResizableYouTubePlayer component