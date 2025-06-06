class PopupYouTubePlayer {
  constructor() {
    this.popupWindow = null;
    this.currentPlaylistId = null;
    this.isPlaying = false;
    this.onCloseCallback = null;
    this.autoCloseTimeout = null;
    this.currentVolume = 50;
    this.isShuffled = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async playPlaylist(playlistId, options = {}) {
    console.log('🎵 Starting YouTube playlist with robust error handling:', playlistId);
    
    this.currentPlaylistId = playlistId;
    this.isShuffled = options.shuffle || false;
    
    // ✅ FIX: Force close any existing popup first
    this.forceCloseExisting();
    
    // Reset retry count for new playlist
    this.retryCount = 0;
    
    return this.attemptPlaylistOpen(playlistId, options);
  }

  forceCloseExisting() {
    if (this.popupWindow && !this.popupWindow.closed) {
      console.log('🎵 Force closing existing YouTube popup');
      try {
        this.popupWindow.close();
      } catch (error) {
        console.warn('Error force closing popup:', error);
      }
    }
    
    this.popupWindow = null;
    this.isPlaying = false;
    
    // Clear any existing timeouts
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }
  }

  async attemptPlaylistOpen(playlistId, options = {}) {
    try {
      // Popup dimensions and position
      const width = 480;
      const height = 360;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      // Enhanced URL with better parameters
      const shuffleParam = this.isShuffled ? '&shuffle=1' : '';
      const youtubeUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&controls=1&rel=0&modestbranding=1${shuffleParam}`;
      
      console.log(`🎵 Opening YouTube popup (attempt ${this.retryCount + 1}/${this.maxRetries})`);
      
      // Create popup window with unique name to avoid conflicts
      const popupName = `youtubePlayer_${Date.now()}`;
      this.popupWindow = window.open(
        '',
        popupName,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
      );
      
      if (!this.popupWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // ✅ FIX: Enhanced HTML with better error handling
      this.popupWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>🎵 YouTube Playlist Player</title>
          <style>
            body { margin: 0; padding: 0; background: #000; font-family: Arial, sans-serif; }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 8px 12px; 
              font-size: 12px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .status { 
              font-size: 10px; 
              opacity: 0.8; 
              display: flex; 
              align-items: center; 
              gap: 4px;
            }
            .pulse { animation: pulse 2s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
            .close-btn { 
              background: #ff4444; 
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 4px; 
              cursor: pointer; 
              font-size: 11px; 
              transition: background 0.2s;
            }
            .close-btn:hover { background: #ff6666; }
            #player { 
              width: 100%; 
              height: calc(100vh - 40px); 
              border: none; 
              background: #000;
            }
            .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span>🎵 Reclamepauze Muziek</span>
              <div class="status">
                <span class="pulse">●</span>
                <span>Actief</span>
              </div>
            </div>
            <button class="close-btn" onclick="closePlayer()" title="Sluit muziek">✕</button>
          </div>
          <div id="loading" class="loading">
            <div>🎵 Loading YouTube playlist...</div>
          </div>
          <iframe 
            id="player"
            src="${youtubeUrl}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            loading="eager"
            onload="hideLoading()"
            onerror="handleError()">
          </iframe>
          <script>
            function hideLoading() {
              document.getElementById('loading').style.display = 'none';
            }
            
            function handleError() {
              console.error('YouTube iframe failed to load');
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'youtube_error',
                  error: 'iframe_load_failed'
                }, '*');
              }
            }
            
            function closePlayer() {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'youtube_popup_closed',
                  reason: 'user_close'
                }, '*');
              }
              window.close();
            }
            
            // Enhanced message listener
            window.addEventListener('message', (event) => {
              if (event.source !== window.opener) return;
              
              const { type, data } = event.data;
              console.log('YouTube popup received message:', type, data);
              
              switch(type) {
                case 'close':
                  closePlayer();
                  break;
                case 'volume':
                  // Volume is handled by iframe, just acknowledge
                  console.log('Volume set to:', data.volume);
                  break;
                case 'shuffle':
                  console.log('Shuffle set to:', data.enabled);
                  break;
              }
            });
            
            // Notify parent when popup closes
            window.addEventListener('beforeunload', () => {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'youtube_popup_closed',
                  reason: 'user_close'
                }, '*');
              }
            });
            
            // Auto-focus iframe after load
            setTimeout(() => {
              const iframe = document.getElementById('player');
              if (iframe) {
                iframe.focus();
                hideLoading();
              }
            }, 2000);
          </script>
        </body>
        </html>
      `);
      
      this.popupWindow.document.close();
      this.isPlaying = true;
      this.setupPopupListeners();
      
      // Auto-close integration for ad breaks
      if (options.autoCloseDuration) {
        console.log(`🎵 YouTube popup will auto-close in ${options.autoCloseDuration} minutes`);
        this.autoCloseTimeout = setTimeout(() => {
          console.log('🎵 Auto-closing YouTube popup (ad break ended)');
          this.closePopup('ad_break_ended');
        }, options.autoCloseDuration * 60 * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error(`YouTube popup attempt ${this.retryCount + 1} failed:`, error);
      
      this.retryCount++;
      if (this.retryCount < this.maxRetries) {
        console.log(`🔄 Retrying YouTube popup (${this.retryCount}/${this.maxRetries}) in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.attemptPlaylistOpen(playlistId, options);
      }
      
      console.error('🎵 YouTube popup failed after all retries');
      throw error;
    }
  }

  setupPopupListeners() {
    const messageHandler = (event) => {
      if (event.data.type === 'youtube_popup_closed') {
        console.log('🎵 YouTube popup closed:', event.data.reason);
        this.isPlaying = false;
        this.popupWindow = null;
        
        // Clear auto-close timeout if user manually closed
        if (this.autoCloseTimeout) {
          clearTimeout(this.autoCloseTimeout);
          this.autoCloseTimeout = null;
        }
        
        if (this.onCloseCallback) {
          this.onCloseCallback(event.data.reason || 'unknown');
        }
        window.removeEventListener('message', messageHandler);
      } else if (event.data.type === 'youtube_error') {
        console.error('🎵 YouTube popup error:', event.data.error);
        // Try to recover by restarting
        if (this.currentPlaylistId && this.retryCount < this.maxRetries) {
          setTimeout(() => {
            this.playPlaylist(this.currentPlaylistId, { shuffle: this.isShuffled });
          }, 3000);
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Enhanced popup monitoring
    const checkPopup = () => {
      if (this.popupWindow && this.popupWindow.closed) {
        console.log('🎵 YouTube popup was closed externally');
        this.isPlaying = false;
        this.popupWindow = null;
        
        // Clear auto-close timeout
        if (this.autoCloseTimeout) {
          clearTimeout(this.autoCloseTimeout);
          this.autoCloseTimeout = null;
        }
        
        if (this.onCloseCallback) {
          this.onCloseCallback('popup_closed');
        }
        return;
      }
      if (this.isPlaying) setTimeout(checkPopup, 1000);
    };
    
    setTimeout(checkPopup, 1000);
  }

  // Enhanced close with reason tracking
  closePopup(reason = 'manual') {
    console.log('🎵 Closing YouTube popup, reason:', reason);
    
    if (this.popupWindow && !this.popupWindow.closed) {
      try {
        // Send close message to popup
        this.popupWindow.postMessage({ type: 'close' }, '*');
        
        // Force close after a moment
        setTimeout(() => {
          if (this.popupWindow && !this.popupWindow.closed) {
            this.popupWindow.close();
          }
        }, 500);
      } catch (error) {
        console.warn('Error closing popup:', error);
      }
      
      this.popupWindow = null;
      this.isPlaying = false;
    }
    
    // Clear auto-close timeout
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }
    
    // Reset retry count
    this.retryCount = 0;
    
    // Notify callback with reason
    if (this.onCloseCallback && reason !== 'manual') {
      this.onCloseCallback(reason);
    }
  }

  // Enhanced control methods
  setVolume(volume) {
    this.currentVolume = volume;
    if (this.popupWindow && !this.popupWindow.closed) {
      try {
        this.popupWindow.postMessage({
          type: 'volume',
          data: { volume: Math.round(volume) }
        }, '*');
      } catch (error) {
        console.warn('Could not send volume message to popup:', error);
      }
    }
    console.log(`🎵 YouTube volume set to: ${volume}%`);
  }

  setShuffle(enabled) {
    this.isShuffled = enabled;
    if (this.popupWindow && !this.popupWindow.closed) {
      try {
        this.popupWindow.postMessage({
          type: 'shuffle',
          data: { enabled }
        }, '*');
      } catch (error) {
        console.warn('Could not send shuffle message to popup:', error);
      }
    }
    console.log(`🎵 YouTube shuffle ${enabled ? 'enabled' : 'disabled'}`);
  }

  nextVideo() {
    if (this.popupWindow && !this.popupWindow.closed) {
      try {
        this.popupWindow.postMessage({ type: 'next' }, '*');
        console.log('🎵 YouTube next track requested');
      } catch (error) {
        console.warn('Could not send next message to popup:', error);
      }
    }
  }

  pauseVideo() { this.closePopup('paused'); }
  stopVideo() { this.closePopup('stopped'); }
  pause() { this.pauseVideo(); }
  
  resume() { 
    if (this.currentPlaylistId) {
      this.playPlaylist(this.currentPlaylistId, { 
        shuffle: this.isShuffled 
      }); 
    }
  }
  
  onClose(callback) { this.onCloseCallback = callback; }
  destroy() { this.closePopup('destroy'); }
}

export const popupYouTubePlayer = new PopupYouTubePlayer();