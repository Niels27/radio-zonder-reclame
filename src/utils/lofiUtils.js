// Lofi Girl stream management with YouTube popup support

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
let currentLofiPopup = null;

export const getNextLofiStream = () => {
  // Find next working stream that hasn't failed
  let attempts = 0;
  let stream = null;
  
  while (attempts < LOFI_STREAMS.length) {
    stream = LOFI_STREAMS[currentLofiIndex];
    currentLofiIndex = (currentLofiIndex + 1) % LOFI_STREAMS.length;
    
    // Skip failed streams unless we've tried all others
    if (!failedStreams.has(stream.name) || attempts === LOFI_STREAMS.length - 1) {
      break;
    }
    
    attempts++;
  }
  
  return stream;
};

export const markLofiStreamAsFailed = (streamName) => {
  console.log(`🚫 Marking lofi stream as failed: ${streamName}`);
  failedStreams.add(streamName);
  
  // If too many streams failed, reset the failed list
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

// Open YouTube in popup for lofi playback
// Update the openLofiYouTubePopup function:

// Replace the openLofiYouTubePopup function:

// Replace the openLofiYouTubePopup function:

// Replace the openLofiYouTubePopup function with this much more reliable version:

export const openLofiYouTubePopup = (videoId, duration) => {
  return new Promise((resolve, reject) => {
    try {
      // ✅ CRITICAL FIX: Better check for existing popup
      if (currentLofiPopup && !currentLofiPopup.closed) {
        try {
          // Try to focus the existing popup to test if it's really alive
          currentLofiPopup.focus();
          console.log('🎵 Lofi popup already open and working - reusing existing popup');
          resolve(currentLofiPopup);
          return;
        } catch (error) {
          // If focus fails, popup might be dead, continue to create new one
          console.log('🎵 Existing popup appears dead, creating new one');
          currentLofiPopup = null;
          window.currentLofiPopup = null;
        }
      }

      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&autoplay=1&loop=1&playlist=${videoId}`;
      
      // Calculate popup size and position
      const width = 800;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popupFeatures = [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        'menubar=no',
        'toolbar=no',
        'location=no',
        'status=no',
        'scrollbars=yes',
        'resizable=yes'
      ].join(',');

      console.log('🎵 Opening NEW Lofi YouTube popup:', youtubeUrl);
      
      currentLofiPopup = window.open(youtubeUrl, 'lofiPlayer', popupFeatures);
      
      if (!currentLofiPopup) {
        reject(new Error('Popup blocked by browser'));
        return;
      }

      // ✅ CRITICAL FIX: Much more lenient popup validation
      // Just check immediately if window.open returned a valid object
      try {
        // Test if we can access basic properties (this will fail if popup is blocked)
        const hasValidReference = currentLofiPopup && typeof currentLofiPopup.closed === 'boolean';
        
        if (hasValidReference) {
          // SUCCESS - we have a valid popup reference
          console.log('🎵 Lofi popup opened successfully');
          window.currentLofiPopup = currentLofiPopup;
          resolve(currentLofiPopup);
          
          // Optional: Set up a listener to detect if popup gets closed later
          const checkInterval = setInterval(() => {
            if (currentLofiPopup && currentLofiPopup.closed) {
              console.log('🎵 Lofi popup was closed by user');
              currentLofiPopup = null;
              window.currentLofiPopup = null;
              clearInterval(checkInterval);
            }
          }, 2000);
          
          // Clear interval after 30 seconds to avoid memory leaks
          setTimeout(() => clearInterval(checkInterval), 30000);
          
        } else {
          // FAILED - popup was blocked
          console.warn('🎵 Lofi popup was blocked');
          currentLofiPopup = null;
          window.currentLofiPopup = null;
          reject(new Error('Popup was blocked by browser'));
        }
        
      } catch (error) {
        console.error('🎵 Error validating popup:', error);
        reject(new Error('Failed to validate popup'));
      }
      
    } catch (error) {
      console.error('Failed to open lofi YouTube popup:', error);
      reject(error);
    }
  });
};
// Close the lofi popup
export const closeLofiYouTubePopup = () => {
  try {
    if (currentLofiPopup && !currentLofiPopup.closed) {
      console.log('🎵 Closing Lofi YouTube popup');
      currentLofiPopup.close();
    }
  } catch (error) {
    console.warn('Error closing Lofi popup:', error);
  } finally {
    // Always clean up references
    currentLofiPopup = null;
    window.currentLofiPopup = null;
  }
};

// Check if popup is still open
// Replace the isLofiPopupOpen function:

export const isLofiPopupOpen = () => {
  try {
    if (!currentLofiPopup) {
      return false;
    }
    
    // Check if popup is still open and accessible
    if (currentLofiPopup.closed) {
      // Popup was closed, clean up references
      currentLofiPopup = null;
      window.currentLofiPopup = null;
      return false;
    }
    
    // Try to access a property to test if popup is still alive
    try {
      // This will throw if popup is from different origin or blocked
      const isAlive = typeof currentLofiPopup.closed === 'boolean';
      return isAlive;
    } catch (error) {
      // Cross-origin or blocked popup
      console.log('🎵 Popup access restricted (cross-origin), assuming it\'s working');
      return true; // Assume it's working if we can't check due to cross-origin
    }
    
  } catch (error) {
    console.warn('Error checking if lofi popup is open:', error);
    return false;
  }
};

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