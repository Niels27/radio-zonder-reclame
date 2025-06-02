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
    }    const playerOptions = {
      height: '1',
      width: '1',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 0, // Disable autoplay to reduce tracking
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        // Enhanced parameters to bypass embedding restrictions
        host: 'https://www.youtube-nocookie.com',
        origin: window.location.origin,
        // Privacy enhanced mode
        cc_load_policy: 0,
        color: 'white',
        hl: 'en',
        // Force HTML5 player
        html5: 1,
        // Try to force audio-only by hiding video
        vq: 'tiny',
        ...options.playerVars
      },
      events: {
        onReady: (event) => {
          console.log('YouTube player ready for background playback');
          
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
          
          // Handle embedding errors and retry with fallback
          if (event.data === -1) { // unstarted
            console.log('Player unstarted, attempting to start playback...');
          } else if (event.data === window.YT.PlayerState.BUFFERING) {
            console.log('Player buffering...');
          }
          
          // Handle state changes
          if (options.onStateChange) {
            options.onStateChange(event);
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
          
          // Handle specific error codes
          switch(event.data) {
            case 5:
              reject(new Error('HTML5 player error - video format not supported'));
              break;
            case 100:
              reject(new Error('Video not found'));
              break;            case 101:
            case 150:
              console.warn('Embedding restricted (error 150/101), implementing enhanced bypass strategies...');
              // Enhanced bypass strategies for embedding restrictions
              if (options.onEmbeddingError) {
                options.onEmbeddingError(event.data);
              }
              
              // Don't reject immediately - try multiple bypass strategies
              setTimeout(() => {
                try {
                  console.log('Attempting bypass strategy 1: Direct playVideo call');
                  if (window.debugYTPlayer) {
                    window.debugYTPlayer.playVideo();
                  }
                } catch (bypassErr) {
                  console.warn('Bypass strategy 1 failed:', bypassErr);
                }
              }, 3000);
              
              // Additional bypass attempt with longer delay
              setTimeout(() => {
                try {
                  console.log('Attempting bypass strategy 2: Reload and play');
                  if (window.debugYTPlayer && window.debugYTPlayer.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                    window.debugYTPlayer.playVideo();
                  }
                } catch (bypassErr2) {
                  console.warn('Bypass strategy 2 failed:', bypassErr2);
                }
              }, 8000);
              
              break;
            default:
              reject(new Error(`YouTube player error: ${event.data}`));
          }
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

// Enhanced hidden player creation to bypass embedding restrictions
export const createHiddenYouTubePlayer = (elementId, playlistId, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.YT) {
      reject(new Error('YouTube API not loaded'));
      return;
    }

    // Create a truly hidden container
    let playerDiv = document.getElementById(elementId);
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = elementId;
      // Make it completely invisible and inaccessible
      playerDiv.style.cssText = `
        position: fixed !important;
        top: -10000px !important;
        left: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
        z-index: -9999 !important;
        overflow: hidden !important;
        transform: scale(0) !important;
      `;
      document.body.appendChild(playerDiv);
    }    const playerOptions = {
      height: '0',      width: '0',
      videoId: '', // Start without specific video
      playerVars: {        listType: 'playlist',
        list: playlistId,
        autoplay: 0, // Disable autoplay to reduce tracking spam
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        // Use nocookie domain to reduce tracking and potentially bypass some restrictions
        host: 'https://www.youtube-nocookie.com',
        origin: window.location.origin,
        // Additional parameters to help bypass embedding restrictions
        cc_load_policy: 0,
        color: 'white',
        hl: 'en',
        html5: 1,
        // Try different quality to reduce bandwidth and potentially bypass restrictions
        vq: 'tiny',
        // Disable annotations and cards
        iv_load_policy: 3,
        // Try to minimize video processing
        start: 0,
        end: 0,
        // Enhanced bypass parameters
        widget_referrer: window.location.origin,
        eow: 1, // End of video overlay disabled
        theme: 'dark',
        // Experimental: try to force audio-only mode
        fmt: '251', // WebM audio-only format
        // Additional stealth parameters
        wmode: 'transparent',
        allowfullscreen: 'false',
        ...options.playerVars
      },
      events: {        onReady: (event) => {
          console.log('Hidden YouTube player ready for background audio playback');
          
          // Immediately try to start the playlist with retry mechanism
          const startPlaylist = async () => {
            try {
              // First attempt with standard loadPlaylist
              await event.target.loadPlaylist({
                listType: 'playlist',
                list: playlistId,
                index: 0,
                startSeconds: 0,
                suggestedQuality: 'tiny'
              });
                // Set initial shuffle state
              if (options.playerVars?.shuffle) {
                event.target.setShuffle(true);
              }
              
              // Force start if not autoplayng
              setTimeout(() => {
                try {
                  if (event.target.getPlayerState() === window.YT.PlayerState.UNSTARTED) {
                    event.target.playVideo();
                  }
                } catch (err) {
                  // Silently handle errors to reduce spam
                }
              }, 1000);
              
            } catch (error) {
              console.warn('Error setting up hidden player, trying alternative approach:', error);
              
              // Fallback: try cuePlaylist instead of loadPlaylist
              try {
                event.target.cuePlaylist({
                  listType: 'playlist',
                  list: playlistId,
                  index: 0,
                  startSeconds: 0,
                  suggestedQuality: 'tiny'
                });
                
                setTimeout(() => {
                  event.target.playVideo();
                }, 500);
                
              } catch (fallbackError) {
                console.warn('Fallback playlist loading also failed:', fallbackError);
              }
            }
          };
          
          startPlaylist();
          resolve(event.target);
        },        onStateChange: (event) => {
          // Reduce logging spam - only log important states
          if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.PAUSED) {
            // Only log playing/paused states for debugging
          }
          
          // Handle different states
          if (event.data === window.YT.PlayerState.PLAYING) {
            // Ensure the div stays hidden even during playback
            if (playerDiv) {
              playerDiv.style.cssText = `
                position: fixed !important;
                top: -10000px !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                opacity: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
                z-index: -9999 !important;
                overflow: hidden !important;
                transform: scale(0) !important;
              `;
            }
          } else if (event.data === window.YT.PlayerState.UNSTARTED) {
            // Try to start playback if it's stuck
            setTimeout(() => {
              try {
                event.target.playVideo();
                console.log('Attempting to unstick hidden player');
              } catch (err) {
                console.warn('Could not unstick player:', err);
              }
            }, 2000);
          } else if (event.data === window.YT.PlayerState.CUED) {
            // Playlist is cued, try to play
            setTimeout(() => {
              try {
                event.target.playVideo();
                console.log('Playing cued playlist');
              } catch (err) {
                console.warn('Could not play cued playlist:', err);
              }
            }, 500);
          }
          
          // Handle state changes
          if (options.onStateChange) {
            options.onStateChange(event);
          }
        },        onError: (event) => {
          console.error('Hidden YouTube player error:', event.data);
          
          // Handle specific errors more gracefully
          switch(event.data) {
            case 5:
              console.warn('HTML5 player error in hidden mode - continuing anyway');
              // Don't reject immediately, might still work for audio
              break;            case 100:
              // Silently handle video not found and try next
              try {
                event.target.nextVideo();
              } catch (err) {
                // Silent handling
              }
              break;
            case 101:
              // Silently handle embedding disabled and continue
              if (options.onEmbeddingError) {
                options.onEmbeddingError(event.data);
              }
              break;
            case 150:
              // Silently handle playback restrictions
              // This is the main error we're trying to bypass
              // Don't reject - try to continue for audio playback
              if (options.onEmbeddingError) {
                options.onEmbeddingError(event.data);
              }
              
              // Try alternative approach with setTimeout to bypass detection
              setTimeout(() => {
                try {
                  console.log('Attempting stealth retry after error 150');
                  event.target.playVideo();
                } catch (retryErr) {
                  console.warn('Stealth retry failed:', retryErr);
                }
              }, 3000);
              break;
            default:
              console.warn(`Unknown YouTube error ${event.data} in hidden mode - attempting to continue`);
              // Only reject for truly fatal errors
              if (event.data > 200) {
                reject(new Error(`YouTube player fatal error: ${event.data}`));
              } else {
                // For other errors, try to continue
                setTimeout(() => {
                  try {
                    event.target.playVideo();
                  } catch (continueErr) {
                    console.warn('Could not continue after error:', continueErr);
                  }
                }, 2000);
              }
          }
        }
      }
    };

    try {
      const player = new window.YT.Player(elementId, playerOptions);
      
      // Store reference for debugging
      window.debugHiddenYTPlayer = player;
        // Additional hiding after creation
      setTimeout(() => {
        if (playerDiv) {
          playerDiv.style.cssText = `
            position: fixed !important;
            top: -10000px !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            z-index: -9999 !important;
            overflow: hidden !important;
            transform: scale(0) !important;
          `;
          
          // Also hide any iframe children
          const iframes = playerDiv.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.style.cssText = `
              position: absolute !important;
              top: -10000px !important;
              left: -10000px !important;
              width: 1px !important;
              height: 1px !important;
              opacity: 0 !important;
              visibility: hidden !important;
              transform: scale(0) !important;
            `;
          });
        }
      }, 100);
      
      // Additional stealth hiding after a longer delay
      setTimeout(() => {
        if (playerDiv) {
          // Move it even further away and make it even smaller
          playerDiv.style.cssText = `
            position: fixed !important;
            top: -50000px !important;
            left: -50000px !important;
            width: 0px !important;
            height: 0px !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            z-index: -99999 !important;
            overflow: hidden !important;
            transform: scale(0) !important;
            clip: rect(0,0,0,0) !important;
          `;
        }
      }, 2000);
      
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
