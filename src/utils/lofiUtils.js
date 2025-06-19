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
let currentLofiOverlay = null;

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

// ✅ NEW: Create a controllable overlay instead of popup
// Replace the openLofiYouTubeOverlay function with this enhanced version:

export const openLofiYouTubeOverlay = (videoId, duration) => {
  return new Promise((resolve, reject) => {
    try {
      // ✅ Check if overlay already exists and is working
      if (currentLofiOverlay && document.body.contains(currentLofiOverlay)) {
        console.log('🎵 Lofi overlay already open and working - reusing existing overlay');
        resolve(currentLofiOverlay);
        return;
      }

      // ✅ Create overlay container
      const overlay = document.createElement('div');
      overlay.id = 'lofi-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
      `;

      // ✅ Create video container
      const container = document.createElement('div');
      container.style.cssText = `
        background: #1f2937;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        transition: all 0.3s ease;
      `;

      // ✅ Create header with title and buttons
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        color: white;
      `;

      const title = document.createElement('h3');
      title.textContent = 'Lofi Girl - Study Stream';
      title.style.cssText = `
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      `;

      // ✅ Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        align-items: center;
      `;

      // ✅ Create minimize button
      const minimizeButton = document.createElement('button');
      minimizeButton.innerHTML = '−';
      minimizeButton.style.cssText = `
        background: #3b82f6;
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      `;
      
      minimizeButton.onmouseover = () => {
        minimizeButton.style.background = '#2563eb';
        minimizeButton.style.transform = 'scale(1.1)';
      };
      minimizeButton.onmouseout = () => {
        minimizeButton.style.background = '#3b82f6';
        minimizeButton.style.transform = 'scale(1)';
      };

      // ✅ Create close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.cssText = `
        background: #ef4444;
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      `;
      
      closeButton.onmouseover = () => {
        closeButton.style.background = '#dc2626';
        closeButton.style.transform = 'scale(1.1)';
      };
      closeButton.onmouseout = () => {
        closeButton.style.background = '#ef4444';
        closeButton.style.transform = 'scale(1)';
      };

      // ✅ Create iframe for YouTube
      const iframe = document.createElement('iframe');
      const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
      iframe.src = youtubeUrl;
      iframe.style.cssText = `
        width: 800px;
        height: 450px;
        border: none;
        border-radius: 8px;
        transition: all 0.3s ease;
      `;
      iframe.allow = 'autoplay; encrypted-media';

      // ✅ Create timer display
      const timerDisplay = document.createElement('div');
      timerDisplay.style.cssText = `
        margin-top: 15px;
        text-align: center;
        color: #9ca3af;
        font-size: 14px;
        transition: all 0.3s ease;
      `;

      // ✅ MINIMIZE FUNCTIONALITY
      let isMinimized = false;
      
      const minimizeOverlay = () => {
        if (isMinimized) return;
        
        console.log('🎵 Minimizing Lofi overlay');
        isMinimized = true;
        
        // Change overlay to bottom-right corner
        overlay.style.cssText = `
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 320px;
          height: 200px;
          background: transparent;
          z-index: 10000;
          backdrop-filter: none;
          transition: all 0.3s ease;
          cursor: pointer;
        `;
        
        // Change container to compact style
        container.style.cssText = `
          background: #1f2937;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          position: relative;
          width: 100%;
          height: 100%;
          border: 2px solid #3b82f6;
          transition: all 0.3s ease;
        `;
        
        // Update header
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          color: white;
        `;
        
        // Update title
        title.style.cssText = `
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #93c5fd;
        `;
        title.textContent = 'Lofi Girl';
        
        // Change minimize button to expand button
        minimizeButton.innerHTML = '□';
        minimizeButton.title = 'Maximize';
        
        // Update iframe to smaller size
        iframe.style.cssText = `
          width: 100%;
          height: 140px;
          border: none;
          border-radius: 6px;
          transition: all 0.3s ease;
        `;
        
        // Update timer display
        timerDisplay.style.cssText = `
          margin-top: 5px;
          text-align: center;
          color: #6b7280;
          font-size: 10px;
          transition: all 0.3s ease;
        `;
        
        // Remove backdrop click to minimize (only works in fullscreen)
        overlay.onclick = null;
        
        // Add click to maximize
        container.onclick = (e) => {
          if (e.target === container || e.target === iframe) {
            maximizeOverlay();
          }
        };
      };
      
      const maximizeOverlay = () => {
        if (!isMinimized) return;
        
        console.log('🎵 Maximizing Lofi overlay');
        isMinimized = false;
        
        // Restore original overlay style
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
          transition: all 0.3s ease;
        `;
        
        // Restore original container style
        container.style.cssText = `
          background: #1f2937;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          transition: all 0.3s ease;
        `;
        
        // Restore header
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          color: white;
        `;
        
        // Restore title
        title.style.cssText = `
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        `;
        title.textContent = 'Lofi Girl - Study Stream';
        
        // Change expand button back to minimize button
        minimizeButton.innerHTML = '−';
        minimizeButton.title = 'Minimize';
        
        // Restore iframe
        iframe.style.cssText = `
          width: 800px;
          height: 450px;
          border: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        `;
        
        // Restore timer display
        timerDisplay.style.cssText = `
          margin-top: 15px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          transition: all 0.3s ease;
        `;
        
        // Restore backdrop click to minimize
        overlay.onclick = (e) => {
          if (e.target === overlay) minimizeOverlay();
        };
        
        // Remove container click
        container.onclick = null;
      };

      // ✅ Close function that we control
      const closeOverlay = () => {
        console.log('🎵 Closing Lofi overlay');
        if (overlay && document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        currentLofiOverlay = null;
        window.currentLofiOverlay = null;
        
        // Clear timer if exists
        if (window.lofiOverlayTimer) {
          clearInterval(window.lofiOverlayTimer);
          window.lofiOverlayTimer = null;
        }
      };

      // ✅ Set up button handlers
      minimizeButton.onclick = (e) => {
        e.stopPropagation();
        if (isMinimized) {
          maximizeOverlay();
        } else {
          minimizeOverlay();
        }
      };
      
      closeButton.onclick = (e) => {
        e.stopPropagation();
        closeOverlay();
      };
      
      // ✅ Initial backdrop click to minimize (only in fullscreen mode)
      overlay.onclick = (e) => {
        if (e.target === overlay && !isMinimized) {
          minimizeOverlay();
        }
      };

      // ✅ ESC key handler
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          if (isMinimized) {
            closeOverlay();
          } else {
            minimizeOverlay();
          }
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      // ✅ Auto-close timer (optional)
      if (duration && duration > 0) {
        let timeLeft = duration * 60; // Convert to seconds
        
        const updateTimer = () => {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          const timeText = `Auto-close in ${minutes}:${seconds.toString().padStart(2, '0')}`;
          timerDisplay.textContent = timeText;
          timeLeft--;
          
          if (timeLeft < 0) {
            console.log('🎵 Auto-closing Lofi overlay after timer');
            closeOverlay();
          }
        };
        
        updateTimer(); // Initial update
        window.lofiOverlayTimer = setInterval(updateTimer, 1000);
      } else {
        timerDisplay.textContent = 'Playing until manually closed';
      }

      // ✅ Assemble the overlay
      buttonContainer.appendChild(minimizeButton);
      buttonContainer.appendChild(closeButton);
      
      header.appendChild(title);
      header.appendChild(buttonContainer);
      
      container.appendChild(header);
      container.appendChild(iframe);
      container.appendChild(timerDisplay);
      
      overlay.appendChild(container);      // ✅ Add to DOM
      document.body.appendChild(overlay);
      
      // ✅ Store reference and global functions
      currentLofiOverlay = overlay;
      window.currentLofiOverlay = overlay;
      window.closeLofiOverlay = closeOverlay;
      window.minimizeLofiOverlay = minimizeOverlay;
      window.maximizeLofiOverlay = maximizeOverlay;      // ✅ Start minimized immediately for less intrusive experience
      minimizeOverlay();
      console.log('🎵 Lofi overlay started in minimized mode');

      console.log('🎵 Lofi overlay created successfully');
      resolve(overlay);

    } catch (error) {
      console.error('Failed to create lofi overlay:', error);
      reject(error);
    }
  });
};

// ✅ NEW: Close the overlay (we have full control)
export const closeLofiYouTubeOverlay = () => {
  try {
    if (window.closeLofiOverlay) {
      window.closeLofiOverlay();
    } else if (currentLofiOverlay && document.body.contains(currentLofiOverlay)) {
      document.body.removeChild(currentLofiOverlay);
      currentLofiOverlay = null;
      window.currentLofiOverlay = null;
    }
  } catch (error) {
    console.warn('Error closing Lofi overlay:', error);
  }
};

// ✅ NEW: Check if overlay is open (reliable)
export const isLofiOverlayOpen = () => {
  return currentLofiOverlay && document.body.contains(currentLofiOverlay);
};

// Keep the old popup functions as fallback, but prefer overlay
export const openLofiYouTubePopup = openLofiYouTubeOverlay;
export const isLofiPopupOpen = isLofiOverlayOpen;

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