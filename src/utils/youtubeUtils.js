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
      thumbnail: null,
      title: null,
      name: null,
      videoCount: null
    };
  }

  try {
    // Try to fetch basic playlist info first using oembed
    const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`);
    
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      
      // Try to get more detailed info by scraping the playlist page
      try {
        const pageResponse = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (pageResponse.ok) {
          const pageText = await pageResponse.text();
          
          // Extract playlist title from page
          const titleMatch = pageText.match(/<title>([^<]+)<\/title>/);
          const playlistTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : oembedData.title;
          
          // Extract thumbnail - try to get a better one
          const thumbnailMatch = pageText.match(/"thumbnails":\[{"url":"([^"]+)"/);
          const thumbnail = thumbnailMatch ? thumbnailMatch[1] : oembedData.thumbnail_url;
          
          return {
            isValid: true,
            playlistId,
            error: null,
            thumbnail: thumbnail,
            title: playlistTitle,
            name: playlistTitle,
            videoCount: null
          };
        }
      } catch (pageError) {
        console.warn('Could not fetch detailed playlist info:', pageError);
      }
      
      // Fallback to oembed data
      return {
        isValid: true,
        playlistId,
        error: null,
        thumbnail: oembedData.thumbnail_url,
        title: oembedData.title,
        name: oembedData.title,
        videoCount: null
      };
    } else if (oembedResponse.status === 401 || oembedResponse.status === 403) {
      return {
        isValid: false,
        playlistId,
        error: 'Afspeellijst is privé of niet toegankelijk',
        thumbnail: null,
        title: null,
        name: null,
        videoCount: null
      };
    } else if (oembedResponse.status === 404) {
      return {
        isValid: false,
        playlistId,
        error: 'Afspeellijst bestaat niet',
        thumbnail: null,
        title: null,
        name: null,
        videoCount: null
      };
    } else {
      return {
        isValid: false,
        playlistId,
        error: 'Kan afspeellijst niet valideren',
        thumbnail: null,
        title: null,
        name: null,
        videoCount: null
      };
    }
  } catch (error) {
    // Network error or other issues
    return {
      isValid: false,
      playlistId,
      error: 'Netwerkfout bij validatie van afspeellijst',
      thumbnail: null,
      title: null,
      name: null,
      videoCount: null
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
    if (!window.YT) {
      reject(new Error('YouTube API not loaded'));
      return;
    }

    const playerOptions = {
      height: '1',
      width: '1',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        origin: window.location.origin,
        ...options.playerVars
      },
      events: {
        onReady: (event) => {
          console.log('YouTube player ready');
          
          // Set initial shuffle state
          if (options.playerVars?.shuffle) {
            try {
              event.target.setShuffle(true);
              console.log('Shuffle enabled on player ready');
            } catch (error) {
              console.warn('Could not set shuffle on ready:', error);
            }
          }
          
          resolve(event.target);
        },
        onStateChange: (event) => {
          console.log('YouTube player state changed:', event.data);
          
          // Handle state changes
          if (options.onStateChange) {
            options.onStateChange(event);
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event);
          reject(new Error(`YouTube player error: ${event.data}`));
        }
      }
    };

    try {
      const player = new window.YT.Player(elementId, playerOptions);
      
      // Store reference for debugging
      window.debugYTPlayer = player;
      
    } catch (error) {
      reject(error);
    }
  });
};

// Playlist control helper functions and icons
export const playlistControlIcons = {
  shuffle: {
    enabled: 'shuffle-enabled',
    disabled: 'shuffle-disabled'
  },
  repeat: {
    all: 'repeat-all',
    one: 'repeat-one', 
    off: 'repeat-off'
  }
};
