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

// ✅ NEW: Volume synchronization for lofi overlay
let currentLofiVolume = 0.5; // Store current volume (0.0 to 1.0)
let lofiIframeRef = null; // Reference to the iframe for volume control

// ✅ NEW: Global volume sync function for lofi overlay
export const syncLofiVolume = (volume) => {
  currentLofiVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
 // console.log(`🎵 Syncing lofi volume to ${Math.round(currentLofiVolume * 100)}%`);
  
  // Update timer display if overlay is open
  if (currentLofiOverlay && document.body.contains(currentLofiOverlay)) {
    const timerDisplay = currentLofiOverlay.querySelector('div[style*="text-align: center"]');
    if (timerDisplay && window.updateLofiTimerDisplay) {
      window.updateLofiTimerDisplay();
    }
  }
  
  // Try to communicate with iframe if available
  if (lofiIframeRef && lofiIframeRef.contentWindow) {
    try {
      // YouTube iframe API volume control (this might not work due to CORS, but we try)
      const message = {
        event: 'command',
        func: 'setVolume',
        args: [currentLofiVolume * 100] // YouTube expects 0-100
      };
      lofiIframeRef.contentWindow.postMessage(JSON.stringify(message), '*');
    } catch (error) {
      console.warn('Could not directly control YouTube iframe volume:', error);
    }
  }
  
  // Store volume in localStorage for persistence
  try {
    localStorage.setItem('lofi_volume', currentLofiVolume.toString());
  } catch (error) {
    console.warn('Could not store lofi volume:', error);
  }
};

// ✅ NEW: Get current lofi volume
export const getLofiVolume = () => {
  return currentLofiVolume;
};

// ✅ NEW: Initialize lofi volume from storage
export const initializeLofiVolume = () => {
  try {
    const storedVolume = localStorage.getItem('lofi_volume');
    if (storedVolume) {
      currentLofiVolume = parseFloat(storedVolume);
    }
  } catch (error) {
    console.warn('Could not load stored lofi volume:', error);
  }
};

// Initialize volume on module load
initializeLofiVolume();

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
      }      // ✅ Display mode management
      let displayMode = 'medium'; // minimized, medium, maximized
      let isPlaying = true;
      let isMuted = false;      // Dragging state
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };
      let position = { x: window.innerWidth - 420, y: window.innerHeight - 400 }; // Default position - RIGHT side above footer for Lofi

      // Common button style
      const buttonStyle = "width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 12px; font-weight: bold; transition: all 0.2s; cursor: pointer; border: none; color: white;";

      // Create main overlay container
      const overlay = document.createElement('div');
      overlay.id = 'lofi-overlay';
      
      // Create iframe
      const iframe = document.createElement('iframe');
      const volumePercent = Math.round(currentLofiVolume * 100);
      const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&enablejsapi=1&volume=${volumePercent}`;
      iframe.src = youtubeUrl;
      iframe.allow = 'autoplay; encrypted-media';
      iframe.style.cssText = 'border: none; background: black; border-radius: 8px;';
      
      lofiIframeRef = iframe;      // Mode switching functions
      const toggleDisplayMode = () => {
        if (displayMode === 'minimized') {
          displayMode = 'medium';
          // Reset to medium mode default position (right side, above footer)
          position = { x: window.innerWidth - 420, y: window.innerHeight - 400 };
        } else if (displayMode === 'medium') {
          displayMode = 'maximized';
          // Reset to maximized mode default position (centered)
          position = { x: (window.innerWidth - 900) / 2, y: (window.innerHeight - 600) / 2 };
        } else {
          displayMode = 'minimized';
          // Reset to minimized mode default position (right side, in footer)
          position = { x: window.innerWidth - 370, y: window.innerHeight - 65 };
        }
        updateDisplay();
      };// Get display mode icon - Shows what it WILL become when clicked
      const getDisplayModeIcon = () => {
        if (displayMode === 'minimized') return '□';      // Will become medium - small square
        if (displayMode === 'medium') return '■';         // Will become maximized - big square
        return '_';                                       // Will become minimized - line
      };

      // Get display mode title - Shows what it WILL become when clicked
      const getDisplayModeTitle = () => {
        if (displayMode === 'minimized') return 'Naar medium weergave';
        if (displayMode === 'medium') return 'Naar volledig scherm';
        return 'Naar minimale weergave';
      };

      // Dragging functionality
      const handleMouseDown = (e) => {
        // Only start dragging if clicking on container areas, not buttons or controls
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button') || e.target.closest('input')) {
          return;
        }
        
        isDragging = true;
        const rect = overlay.getBoundingClientRect();
        dragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      };      const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Allow completely free movement across the entire screen
        position = {
          x: newX,
          y: newY
        };
        
        updateDisplay();
      };

      const handleMouseUp = () => {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      // Add global mouse event listeners for dragging
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Control functions
      const togglePlayPause = () => {
        isPlaying = !isPlaying;
        try {
          if (iframe.contentWindow) {
            const message = isPlaying ? 
              '{"event":"command","func":"playVideo","args":""}' :
              '{"event":"command","func":"pauseVideo","args":""}';
            iframe.contentWindow.postMessage(message, '*');
          }
        } catch (e) {
          // CORS limitations
        }
        updateDisplay();
      };

      const toggleMute = () => {
        isMuted = !isMuted;
        try {
          if (iframe.contentWindow) {
            const volume = isMuted ? 0 : Math.round(currentLofiVolume * 100);
            const message = `{"event":"command","func":"setVolume","args":[${volume}]}`;
            iframe.contentWindow.postMessage(message, '*');
          }
        } catch (e) {
          // CORS limitations
        }
        updateDisplay();
      };

      const handleVolumeChange = (newVolume) => {
        currentLofiVolume = newVolume / 100;
        isMuted = false;
        syncLofiVolume(currentLofiVolume);
        updateDisplay();
      };

      // Settings panel toggle
      let showSettings = false;
      const toggleSettings = () => {
        showSettings = !showSettings;
        updateDisplay();
      };      // Close function
      const closeOverlay = () => {
        console.log('🎵 Closing Lofi overlay');
        
        // ✅ NEW: Notify external listeners that playlist stopped
        if (window.onPlaylistStopped) {
          window.onPlaylistStopped('lofi');
        }
        
        // Clean up event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        if (overlay && document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        currentLofiOverlay = null;
        lofiIframeRef = null;
        if (window.lofiOverlayTimer) {
          clearInterval(window.lofiOverlayTimer);
          window.lofiOverlayTimer = null;
        }
      };

      // Timer management
      let timeLeft = duration ? duration * 60 : null;
      const updateTimer = () => {
        if (timeLeft !== null) {
          if (timeLeft <= 0) {
            closeOverlay();
            return;
          }
          timeLeft--;
        }
      };

      if (timeLeft !== null) {
        window.lofiOverlayTimer = setInterval(updateTimer, 1000);
      }

      // Main update display function
      const updateDisplay = () => {        if (displayMode === 'minimized') {
          // MINIMIZED MODE - Footer bar (can be dragged anywhere)
          overlay.style.cssText = 
            `position: fixed; left: ${position.x}px; top: ${position.y}px; width: 350px; height: 48px; background: #111827; border-radius: 8px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #374151; z-index: 100; transition: none; overflow: hidden; cursor: ${isDragging ? 'grabbing' : 'grab'};`;

          overlay.innerHTML = 
            '<!-- Hidden iframe for audio continuity -->' +
            '<iframe src="' + youtubeUrl + '" allow="autoplay; encrypted-media" style="position: absolute; top: -400px; left: -400px; width: 400px; height: 300px; border: none; pointer-events: none;"></iframe>' +
            '<div style="height: 100%; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; color: white;">' +
              '<div style="display: flex; align-items: center; gap: 8px; flex: 1;">' +
                '<div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>' +
                '<span style="font-size: 12px; font-weight: 600; color: white;">🎵 Lofi Girl</span>' +
              '</div>' +
              '<div style="display: flex; align-items: center; gap: 8px;">' +
                '<button id="lofi-play-btn" style="' + buttonStyle + '; background: ' + (isPlaying ? '#059669' : '#6b7280') + ';" title="' + (isPlaying ? 'Pauzeren' : 'Afspelen') + '">' +
                  (isPlaying ? '⏸' : '▶') +
                '</button>' +
                '<button id="lofi-mute-btn" style="' + buttonStyle + '; background: ' + (isMuted ? '#dc2626' : '#3b82f6') + ';" title="' + (isMuted ? 'Geluid aan' : 'Dempen') + '">' +
                  (isMuted ? '🔇' : '🔊') +
                '</button>' +
                '<div style="width: 48px; margin: 0 4px;">' +
                  '<input type="range" id="lofi-volume" min="0" max="100" value="' + (isMuted ? 0 : Math.round(currentLofiVolume * 100)) + '" style="width: 100%; height: 4px; background: #6b7280; border-radius: 2px; outline: none; cursor: pointer;" />' +
                '</div>' +
              '</div>' +              '<div style="display: flex; align-items: center; gap: 4px;">' +
                '<button id="lofi-display-btn" style="' + buttonStyle + '; background: #3b82f6;" title="' + getDisplayModeTitle() + '">' + getDisplayModeIcon() + '</button>' +
                '<button id="lofi-close-btn" style="' + buttonStyle + '; background: #dc2626;" title="Sluiten">✕</button>' +
              '</div>' +
            '</div>';

        } else if (displayMode === 'maximized') {
          // MAXIMIZED MODE - Full screen overlay
          overlay.style.cssText = 
            'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); transition: all 0.3s ease;';

          const timerText = timeLeft !== null ? 
            'Auto-close in ' + Math.floor(timeLeft / 60) + ':' + (timeLeft % 60).toString().padStart(2, '0') : 
            '';

          overlay.innerHTML = 
            '<div style="background: #111827; border-radius: 12px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 95vw; max-height: 95vh; overflow: hidden; border: 1px solid #374151;">' +
              '<div style="background: #1f2937; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; color: white; margin-bottom: 16px; border-radius: 8px;">' +
                '<div style="display: flex; align-items: center; gap: 12px;">' +
                  '<div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>' +
                  '<span style="font-size: 18px; font-weight: 600;">🎵 Lofi Girl</span>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 8px;">' +                '<button id="lofi-display-btn" style="' + buttonStyle + '; background: #3b82f6;" title="' + getDisplayModeTitle() + '">' + getDisplayModeIcon() + '</button>' +
                '<button id="lofi-close-btn" style="' + buttonStyle + '; background: #dc2626;" title="Sluiten">✕</button>' +
                '</div>' +
              '</div>' +
              (showSettings ? 
                '<div style="background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 12px; margin-bottom: 16px;">' +
                  '<div style="color: #d1d5db; font-size: 14px; margin-bottom: 8px;">Lofi Girl instellingen - <span style="color: #60a5fa;">Study Stream actief</span></div>' +
                  '<div style="color: #9ca3af; font-size: 12px;">Volume wordt gesynchroniseerd met hoofdvolume</div>' +
                '</div>' : '') +
              '<div style="position: relative; width: 900px; height: 500px;">' +
                '<div id="lofi-iframe-container" style="width: 100%; height: 100%;"></div>' +
              '</div>' +
              (timerText ? 
                '<div style="margin-top: 15px; text-align: center; color: #9ca3af; font-size: 14px;">' +
                  timerText + '<br>' +
                  '<span style="font-size: 12px; opacity: 0.7;">🔊 ' + Math.round(currentLofiVolume * 100) + '%</span>' +
                '</div>' : 
                '<div style="margin-top: 15px; text-align: center; color: #9ca3af; font-size: 14px;">' +
                  '<span style="font-size: 12px; opacity: 0.7;">🔊 ' + Math.round(currentLofiVolume * 100) + '%</span>' +
                '</div>') +
            '</div>';        } else {
          // MEDIUM MODE - Default floating player (can be dragged anywhere)
          overlay.style.cssText = 
            `position: fixed; left: ${position.x}px; top: ${position.y}px; width: 384px; height: 320px; background: #111827; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #374151; z-index: 10000; transition: none; overflow: hidden; cursor: ${isDragging ? 'grabbing' : 'grab'};`;

          overlay.innerHTML = 
            '<div style="background: #1f2937; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; color: white;">' +
              '<div style="display: flex; align-items: center; gap: 8px; flex: 1;">' +
                '<div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>' +
                '<span style="font-size: 14px; font-weight: 600;">🎵 Lofi Girl</span>' +
              '</div>' +
              '<div style="display: flex; align-items: center; gap: 4px;">' +
                '<button id="lofi-display-btn" style="' + buttonStyle + '; background: #3b82f6;" title="' + getDisplayModeTitle() + '">' + getDisplayModeIcon() + '</button>' +
                '<button id="lofi-settings-btn" style="' + buttonStyle + '; background: #d97706;" title="Instellingen">⚙️</button>' +
                '<button id="lofi-close-btn" style="' + buttonStyle + '; background: #dc2626;" title="Sluiten">✕</button>' +
              '</div>' +
            '</div>' +
            (showSettings ? 
              '<div style="background: #1f2937; border-top: 1px solid #374151; padding: 8px;">' +
                '<div style="color: #d1d5db; font-size: 12px; margin-bottom: 4px;">Lofi Girl - <span style="color: #60a5fa;">Study Stream</span></div>' +
                '<div style="color: #9ca3af; font-size: 10px;">Volume sync met hoofdvolume actief</div>' +
              '</div>' : '') +
            '<div style="position: relative; height: ' + (showSettings ? '220px' : '280px') + ';">' +
              '<div id="lofi-iframe-container" style="width: 100%; height: 100%;"></div>' +
            '</div>';
        }

        // Add iframe to container
        const iframeContainer = overlay.querySelector('#lofi-iframe-container');
        if (iframeContainer) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframeContainer.appendChild(iframe);
        }        // Add event listeners
        const playBtn = overlay.querySelector('#lofi-play-btn');
        const muteBtn = overlay.querySelector('#lofi-mute-btn');
        const volumeSlider = overlay.querySelector('#lofi-volume');
        const displayBtn = overlay.querySelector('#lofi-display-btn');
        const settingsBtn = overlay.querySelector('#lofi-settings-btn');
        const closeBtn = overlay.querySelector('#lofi-close-btn');

        if (playBtn) playBtn.onclick = togglePlayPause;
        if (muteBtn) muteBtn.onclick = toggleMute;
        if (volumeSlider) {
          volumeSlider.oninput = (e) => handleVolumeChange(parseInt(e.target.value));
        }
        if (displayBtn) displayBtn.onclick = toggleDisplayMode;
        if (settingsBtn) settingsBtn.onclick = toggleSettings;
        if (closeBtn) closeBtn.onclick = closeOverlay;
        
        // Add drag events
        overlay.addEventListener('mousedown', handleMouseDown);
      };

      // Initial display
      updateDisplay();

      // Add to DOM
      document.body.appendChild(overlay);      // Store references
      currentLofiOverlay = overlay;
      window.currentLofiOverlay = overlay;
      window.closeLofiOverlay = closeOverlay;

      console.log('🎵 Lofi overlay created successfully with 3-mode system');
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
    // ✅ NEW: Notify external listeners that playlist stopped
    if (window.onPlaylistStopped) {
      window.onPlaylistStopped('lofi');
    }
    
    if (window.closeLofiOverlay) {
      window.closeLofiOverlay();
    } else if (currentLofiOverlay && document.body.contains(currentLofiOverlay)) {
      document.body.removeChild(currentLofiOverlay);
      currentLofiOverlay = null;
      window.currentLofiOverlay = null;
    }
    
    // ✅ NEW: Clear iframe reference when closing
    lofiIframeRef = null;
    console.log('🎵 Lofi overlay closed and iframe reference cleared');
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

// Add CSS animations for pulse effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 
    '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }' +
    '.lofi-volume-slider::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; cursor: pointer; }' +
    '.lofi-volume-slider::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: none; }';
  document.head.appendChild(style);
}

// ✅ NEW: Expose global functions for testing and debugging (after all functions are declared)
if (typeof window !== 'undefined') {
  window.lofiUtils = {
    syncLofiVolume,
    getLofiVolume,
    initializeLofiVolume,
    isLofiOverlayOpen,
    closeLofiYouTubeOverlay
  };
}

// ✅ NEW: Cross-fade readiness detection for lofi overlay
export const waitForLofiOverlayReady = async (timeoutMs = 8000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkReady = () => {
      // Check if overlay is open and iframe is playing
      const isOverlayOpen = currentLofiOverlay && document.body.contains(currentLofiOverlay);
      const isIframeReady = lofiIframeRef && 
                           window.YT && 
                           window.YT.PlayerState &&
                           lofiIframeRef.getPlayerState &&
                           lofiIframeRef.getPlayerState() === window.YT.PlayerState.PLAYING;
      
      if (isOverlayOpen && isIframeReady) {
        console.log('✅ Lofi overlay ready for cross-fade');
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        console.warn('⏰ Timeout waiting for lofi overlay readiness');
        resolve(false);
        return;
      }
      
      setTimeout(checkReady, 200);
    };
    
    checkReady();
  });
};

// ✅ NEW: Check if lofi overlay is currently playing audio
export const isLofiOverlayPlaying = () => {
  try {
    return currentLofiOverlay && 
           document.body.contains(currentLofiOverlay) &&
           lofiIframeRef &&
           window.YT &&
           window.YT.PlayerState &&
           lofiIframeRef.getPlayerState &&
           lofiIframeRef.getPlayerState() === window.YT.PlayerState.PLAYING;
  } catch (error) {
    console.warn('Error checking lofi overlay play state:', error);
    return false;
  }
};

// ✅ NEW: Set lofi overlay volume for cross-fade
export const setLofiOverlayVolume = (volume) => {
  try {
    if (lofiIframeRef && lofiIframeRef.setVolume) {
      const youtubeVolume = Math.round(Math.max(0, Math.min(100, volume * 100)));
      lofiIframeRef.setVolume(youtubeVolume);
      console.log(`🔊 Lofi overlay volume set to ${youtubeVolume}%`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error setting lofi overlay volume:', error);
    return false;
  }
};