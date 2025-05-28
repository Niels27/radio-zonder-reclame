// YouTube utility functions for playlist handling

export const extractPlaylistId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,  // Standard format
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,  // Direct playlist URL
    /youtu\.be\/.*[?&]list=([a-zA-Z0-9_-]+)/  // Short URL format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export const validatePlaylistUrl = async (url) => {
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return {
      isValid: false,
      playlistId: null,
      error: 'Ongeldig YouTube afspeellijst URL formaat',
      thumbnail: null
    };
  }

  try {
    // Try to fetch playlist info to validate it exists
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        playlistId,
        error: null,
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${playlistId}/mqdefault.jpg`,
        title: data.title
      };
    } else {
      // Fallback validation - just check if playlist ID format is correct
      return {
        isValid: true,
        playlistId,
        error: null,
        thumbnail: `https://img.youtube.com/vi/${playlistId}/mqdefault.jpg`,
        title: 'YouTube Afspeellijst'
      };
    }  } catch {
    // If API fails, still allow if format is correct
    return {
      isValid: true,
      playlistId,
      error: null,
      thumbnail: `https://img.youtube.com/vi/${playlistId}/mqdefault.jpg`,
      title: 'YouTube Afspeellijst'
    };
  }
};

// Load YouTube iframe API
export const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Create script tag for YouTube API
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
};

export const createYouTubePlayer = (elementId, playlistId, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const player = new window.YT.Player(elementId, {
        height: '0',
        width: '0',
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          ...options.playerVars
        },
        events: {
          onReady: () => resolve(player),
          onError: (event) => reject(new Error(`YouTube Player Error: ${event.data}`)),
          ...options.events
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
