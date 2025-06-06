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
    this.currentFallbackIndex = 0;
    this.fallbackMethods = [
      'full_player',      // NEW: Full YouTube player (like radiozondertroep.nl)
      'nocookie_embed',
      'regular_embed', 
      'direct_playlist',
      'mobile_embed',
      'youtube_music'     // NEW: YouTube Music option
    ];
    
    // Load user's preferred method
    this.loadUserPreference();
  }

  // Load user's last preferred method
  loadUserPreference() {
    const savedMethod = localStorage.getItem('youtube_preferred_method');
    if (savedMethod) {
      const methodIndex = this.fallbackMethods.indexOf(savedMethod);
      if (methodIndex !== -1) {
        this.currentFallbackIndex = methodIndex;
        console.log('🎵 Loaded user preference:', savedMethod);
      }
    }
  }

  // Save user's preferred method
  saveUserPreference(method) {
    localStorage.setItem('youtube_preferred_method', method);
    console.log('🎵 Saved user preference:', method);
  }

  // Get the appropriate URL based on fallback method
  getYouTubeUrl(playlistId, method = 'full_player') {
    var shuffleParam = this.isShuffled ? '&shuffle=1' : '';
    var origin = encodeURIComponent(window.location.origin);
    var referrer = encodeURIComponent(window.location.href);
    
    switch (method) {
      case 'full_player':
        // Full YouTube player like radiozondertroep.nl - MOST RELIABLE
        return `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'youtube_music':
        // YouTube Music for better music experience
        return `https://music.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'nocookie_embed':
        return `https://www.youtube-nocookie.com/embed/videoseries?` +
          `list=${playlistId}` +
          `&autoplay=1` +
          `&loop=1` +
          `&controls=1` +
          `&rel=0` +
          `&modestbranding=1` +
          `&iv_load_policy=3` +
          `&fs=1` +
          `&disablekb=0` +
          `&origin=${origin}` +
          `&enablejsapi=1` +
          `&widget_referrer=${referrer}` +
          shuffleParam;
          
      case 'regular_embed':
        return `https://www.youtube.com/embed/videoseries?` +
          `list=${playlistId}` +
          `&autoplay=1` +
          `&loop=1` +
          `&controls=1` +
          `&rel=0` +
          `&modestbranding=1` +
          shuffleParam;
          
      case 'direct_playlist':
        return `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      case 'mobile_embed':
        return `https://m.youtube.com/playlist?list=${playlistId}&autoplay=1${shuffleParam}`;
        
      default:
        return this.getYouTubeUrl(playlistId, 'full_player');
    }
  }

  // Get method display name
  getMethodDisplayName(method) {
    switch (method) {
      case 'full_player': return 'Volledige YouTube Player (Aanbevolen)';
      case 'youtube_music': return 'YouTube Music';
      case 'nocookie_embed': return 'Privacy Mode Embed';
      case 'regular_embed': return 'Standaard Embed';
      case 'direct_playlist': return 'Direct YouTube Link';
      case 'mobile_embed': return 'Mobiele Versie';
      default: return method;
    }
  }

  async playPlaylist(playlistId, options = {}) {
    console.log('🎵 Starting YouTube playlist with user preferences:', playlistId);
    
    this.currentPlaylistId = playlistId;
    this.isShuffled = options.shuffle || false;
    
    // Reset fallback index unless specifically requested
    if (!options.useFallback) {
      this.currentFallbackIndex = parseInt(localStorage.getItem('youtube_preferred_method_index')) || 0;
    }
    
    // Force close any existing popup first
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
      // Popup dimensions and position - larger for full player
      var width = 1000;
      var height = 600;
      var left = (screen.width - width) / 2;
      var top = (screen.height - height) / 2;
      
      // Get current method
      var currentMethod = this.fallbackMethods[this.currentFallbackIndex];
      var youtubeUrl = this.getYouTubeUrl(playlistId, currentMethod);
      
      console.log(`🎵 Opening YouTube popup (attempt ${this.retryCount + 1}/${this.maxRetries}) using method: ${currentMethod}`);
      
      // Create popup window with unique name to avoid conflicts
      var popupName = `youtubePlayer_${Date.now()}`;
      this.popupWindow = window.open(
        '',
        popupName,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
      );
      
      if (!this.popupWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Enhanced HTML with full player support and better controls
      this.popupWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>🎵 YouTube Playlist Player</title>
          <meta name="referrer" content="no-referrer-when-downgrade">
          <meta name="robots" content="noindex, nofollow">
          <meta charset="UTF-8">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background: #000; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 8px 16px; 
              font-size: 13px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              position: relative;
              z-index: 1000;
              height: 40px;
              box-sizing: border-box;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 12px;
              flex: 1;
            }
            .status { 
              font-size: 11px; 
              opacity: 0.9; 
              display: flex; 
              align-items: center; 
              gap: 6px;
            }
            .pulse { 
              animation: pulse 2s infinite; 
              width: 6px;
              height: 6px;
              background: #4ade80;
              border-radius: 50%;
            }
            @keyframes pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
            
            .controls {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .btn {
              background: #4f46e5;
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 6px; 
              cursor: pointer; 
              font-size: 11px; 
              transition: all 0.2s;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .btn:hover { 
              background: #4338ca; 
              transform: translateY(-1px);
            }
            .btn-fallback {
              background: #f59e0b;
              padding: 4px 8px;
              font-size: 10px;
            }
            .btn-fallback:hover { background: #d97706; }
            .btn-close {
              background: #dc2626;
            }
            .btn-close:hover { background: #b91c1c; }
            
            .method-info {
              font-size: 10px;
              opacity: 0.8;
              background: rgba(255,255,255,0.1);
              padding: 2px 6px;
              border-radius: 4px;
              max-width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .player-frame { 
              width: 100%; 
              height: calc(100vh - 40px); 
              border: none; 
              background: #000;
              display: block;
            }
            
            .loading-overlay {
              position: absolute;
              top: 40px;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              z-index: 100;
            }
            
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #374151;
              border-top: 3px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .error-overlay {
              position: absolute;
              top: 40px;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.95);
              display: none;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              z-index: 200;
              padding: 40px;
              text-align: center;
            }
            
            .error-content {
              max-width: 500px;
              background: rgba(239, 68, 68, 0.1);
              border: 2px solid #ef4444;
              border-radius: 12px;
              padding: 30px;
            }
            
            .error-title {
              font-size: 18px;
              margin-bottom: 15px;
              color: #fca5a5;
            }
            
            .error-description {
              font-size: 14px;
              margin-bottom: 25px;
              line-height: 1.5;
              color: #d1d5db;
            }
            
            .fallback-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 12px;
              margin-top: 20px;
            }
            
            .fallback-btn {
              background: #059669;
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 12px;
              transition: all 0.2s;
              font-weight: 500;
            }
            
            .fallback-btn:hover {
              background: #047857;
              transform: translateY(-2px);
            }
            
            .fallback-btn:disabled {
              background: #6b7280;
              cursor: not-allowed;
              transform: none;
            }
            
            .volume-control {
              display: flex;
              align-items: center;
              gap: 6px;
              background: rgba(255,255,255,0.1);
              padding: 4px 8px;
              border-radius: 6px;
            }
            
            .volume-slider {
              width: 60px;
              height: 4px;
              background: rgba(255,255,255,0.3);
              border-radius: 2px;
              outline: none;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <div class="status">
                <div class="pulse"></div>
                <span>🎵 Reclamepauze Muziek</span>
              </div>
              <div class="method-info" title="${this.getMethodDisplayName(currentMethod)}">
                ${this.getMethodDisplayName(currentMethod)}
              </div>
            </div>
            <div class="controls">
              <div class="volume-control" title="Volume">
                <span style="font-size: 10px;">🔊</span>
                <input 
                  type="range" 
                  class="volume-slider" 
                  min="0" 
                  max="100" 
                  value="${this.currentVolume}"
                  onchange="setVolume(this.value)"
                />
              </div>
              <button class="btn btn-fallback" onclick="showFallbackOptions()" title="Probeer andere methode">
                🔄 Andere methode
              </button>
              <button class="btn btn-close" onclick="closePlayer()" title="Sluit muziek">
                ✕ Sluiten
              </button>
            </div>
          </div>
          
          <div id="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <div style="font-size: 16px; margin-bottom: 10px;">🎵 YouTube wordt geladen...</div>
            <div style="font-size: 12px; opacity: 0.8;">${this.getMethodDisplayName(currentMethod)}</div>
            <div style="font-size: 11px; margin-top: 15px; opacity: 0.6;">
              Playlist: ${playlistId}
            </div>
          </div>
          
          <div id="error-overlay" class="error-overlay">
            <div class="error-content">
              <div class="error-title">🚫 YouTube Probleem</div>
              <div class="error-description">
                Deze methode werkt niet goed. Dit kan gebeuren door:<br>
                • Bot detectie van YouTube<br>
                • Geblokkeerde embeds<br>
                • Netwerkproblemen<br><br>
                Probeer een andere methode:
              </div>
              <div class="fallback-grid" id="fallback-buttons">
                <!-- Buttons added by JavaScript -->
              </div>
            </div>
          </div>
          
          <iframe 
            id="player"
            class="player-frame"
            src="${youtubeUrl}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
            loading="eager"
            onload="handlePlayerLoad()"
            onerror="handlePlayerError()">
          </iframe>
          
          <script>
            var currentMethodIndex = ${this.currentFallbackIndex};
            var methods = ${JSON.stringify(this.fallbackMethods)};
            var methodNames = ${JSON.stringify(this.fallbackMethods.map(m => this.getMethodDisplayName(m)))};
            var playlistId = '${playlistId}';
            var playerVolume = ${this.currentVolume};
            var loadTimeout;
            var isFullPlayer = '${currentMethod}' === 'full_player' || '${currentMethod}' === 'youtube_music';
            
            function handlePlayerLoad() {
              console.log('🎵 Player iframe loaded');
              
              // For full player, give more time to load
              var hideDelay = isFullPlayer ? 5000 : 2000;
              
              loadTimeout = setTimeout(function() {
                hideLoading();
                
                // Check for potential bot detection after a moment
                if (isFullPlayer) {
                  setTimeout(checkForIssues, 3000);
                }
              }, hideDelay);
            }
            
            function handlePlayerError() {
              console.error('🎵 Player iframe failed to load');
              clearTimeout(loadTimeout);
              showErrorWithFallbacks();
              notifyParent('youtube_error', { 
                error: 'iframe_load_failed',
                method: methods[currentMethodIndex]
              });
            }
            
            function hideLoading() {
              var loading = document.getElementById('loading');
              if (loading) {
                loading.style.display = 'none';
              }
            }
            
            function checkForIssues() {
              // For full player, we can't detect bot detection easily
              // So we'll rely on user feedback via the fallback button
              console.log('🎵 Player should be ready. If you see issues, use the fallback button.');
            }
            
            function showErrorWithFallbacks() {
              hideLoading();
              document.getElementById('error-overlay').style.display = 'flex';
              
              var buttonsContainer = document.getElementById('fallback-buttons');
              buttonsContainer.innerHTML = '';
              
              methods.forEach(function(method, index) {
                if (index !== currentMethodIndex) {
                  var button = document.createElement('button');
                  button.className = 'fallback-btn';
                  button.textContent = methodNames[index];
                  button.onclick = function() { 
                    tryFallbackMethod(index, true); // Save as preference
                  };
                  buttonsContainer.appendChild(button);
                }
              });
            }
            
            function showFallbackOptions() {
              showErrorWithFallbacks();
            }
            
            function tryFallbackMethod(methodIndex, saveAsPreference) {
              if (saveAsPreference) {
                // Save user's choice
                notifyParent('youtube_save_preference', { 
                  methodIndex: methodIndex,
                  method: methods[methodIndex]
                });
              }
              
              notifyParent('youtube_try_fallback', { 
                methodIndex: methodIndex,
                playlistId: playlistId,
                savePreference: saveAsPreference
              });
              closePlayer();
            }
            
            function setVolume(volume) {
              playerVolume = parseInt(volume);
              notifyParent('youtube_volume_change', { volume: playerVolume });
              
              // Try to control iframe volume if possible (limited due to CORS)
              try {
                var iframe = document.getElementById('player');
                if (iframe && iframe.contentWindow) {
                  // This won't work due to CORS, but attempt anyway
                  iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'setVolume',
                    args: [volume]
                  }), '*');
                }
              } catch (e) {
                console.log('Cannot control iframe volume directly');
              }
            }
            
            function closePlayer() {
              notifyParent('youtube_popup_closed', { reason: 'user_close' });
              window.close();
            }
            
            function notifyParent(type, data) {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: type,
                  data: data || {},
                  timestamp: Date.now()
                }, '*');
              }
            }
            
            // Enhanced message listener
            window.addEventListener('message', function(event) {
              if (event.source !== window.opener) return;
              
              var data = event.data;
              console.log('🎵 Popup received message:', data.type);
              
              switch(data.type) {
                case 'close':
                  closePlayer();
                  break;
                case 'volume':
                  setVolume(data.data.volume);
                  break;
                case 'shuffle':
                  console.log('🎵 Shuffle:', data.data.enabled);
                  break;
              }
            });
            
            // Notify parent when popup closes
            window.addEventListener('beforeunload', function() {
              notifyParent('youtube_popup_closed', { reason: 'window_close' });
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
              if (e.code === 'Space') {
                e.preventDefault();
                // Space to play/pause (if we can control it)
              } else if (e.code === 'Escape') {
                closePlayer();
              }
            });
            
            // Auto-focus for keyboard shortcuts
            window.focus();
            
            console.log('🎵 YouTube popup initialized with method:', '${currentMethod}');
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
    var self = this;
    
    var messageHandler = function(event) {
      if (event.data.type === 'youtube_popup_closed') {
        console.log('🎵 YouTube popup closed:', event.data.data?.reason || 'unknown');
        self.isPlaying = false;
        self.popupWindow = null;
        
        if (self.autoCloseTimeout) {
          clearTimeout(self.autoCloseTimeout);
          self.autoCloseTimeout = null;
        }
        
        if (self.onCloseCallback) {
          self.onCloseCallback(event.data.data?.reason || 'unknown');
        }
        window.removeEventListener('message', messageHandler);
        
      } else if (event.data.type === 'youtube_error') {
        console.error('🎵 YouTube popup error:', event.data.data?.error);
        
      } else if (event.data.type === 'youtube_try_fallback') {
        console.log('🎵 User requested fallback method:', event.data.data?.methodIndex);
        
        self.currentFallbackIndex = event.data.data.methodIndex;
        
        // Save preference if requested
        if (event.data.data.savePreference) {
          const method = self.fallbackMethods[event.data.data.methodIndex];
          self.saveUserPreference(method);
          localStorage.setItem('youtube_preferred_method_index', event.data.data.methodIndex);
        }
        
        setTimeout(() => {
          self.playPlaylist(event.data.data.playlistId, { 
            shuffle: self.isShuffled, 
            useFallback: true 
          });
        }, 500);
        
      } else if (event.data.type === 'youtube_save_preference') {
        // Save user preference
        const method = event.data.data.method;
        self.saveUserPreference(method);
        localStorage.setItem('youtube_preferred_method_index', event.data.data.methodIndex);
        console.log('🎵 Saved user preference:', method);
        
      } else if (event.data.type === 'youtube_volume_change') {
        // Update our volume tracking
        self.currentVolume = event.data.data.volume;
        console.log('🎵 Volume updated from popup:', self.currentVolume);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Enhanced popup monitoring
    var checkPopup = function() {
      if (self.popupWindow && self.popupWindow.closed) {
        console.log('🎵 YouTube popup was closed externally');
        self.isPlaying = false;
        self.popupWindow = null;
        
        if (self.autoCloseTimeout) {
          clearTimeout(self.autoCloseTimeout);
          self.autoCloseTimeout = null;
        }
        
        if (self.onCloseCallback) {
          self.onCloseCallback('popup_closed');
        }
        window.removeEventListener('message', messageHandler);
        return;
      }
      if (self.isPlaying) setTimeout(checkPopup, 1000);
    };
    
    setTimeout(checkPopup, 1000);
  }

  // Method to manually try next fallback
  tryNextFallback() {
    if (this.currentFallbackIndex < this.fallbackMethods.length - 1) {
      this.currentFallbackIndex++;
      const method = this.fallbackMethods[this.currentFallbackIndex];
      console.log('🔄 Trying next fallback method:', method);
      
      // Save as new preference
      this.saveUserPreference(method);
      localStorage.setItem('youtube_preferred_method_index', this.currentFallbackIndex);
      
      if (this.currentPlaylistId) {
        this.playPlaylist(this.currentPlaylistId, { 
          shuffle: this.isShuffled, 
          useFallback: true 
        });
      }
      return true;
    }
    
    console.warn('🚫 No more fallback methods available');
    return false;
  }

  // Get current method info
  getCurrentMethodInfo() {
    return {
      index: this.currentFallbackIndex,
      method: this.fallbackMethods[this.currentFallbackIndex],
      displayName: this.getMethodDisplayName(this.fallbackMethods[this.currentFallbackIndex]),
      hasMoreFallbacks: this.currentFallbackIndex < this.fallbackMethods.length - 1,
      isUserPreferred: localStorage.getItem('youtube_preferred_method') === this.fallbackMethods[this.currentFallbackIndex]
    };
  }

  // Enhanced close with reason tracking
  closePopup(reason = 'manual') {
    console.log('🎵 Closing YouTube popup, reason:', reason);
    
    if (this.popupWindow && !this.popupWindow.closed) {
      try {
        this.popupWindow.postMessage({ type: 'close' }, '*');
        
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
    
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }
    
    this.retryCount = 0;
    
    if (this.onCloseCallback && reason !== 'manual') {
      this.onCloseCallback(reason);
    }
  }

  // Enhanced control methods
  setVolume(volume) {
    this.currentVolume = Math.round(volume);
    if (this.popupWindow && !this.popupWindow.closed) {
      try {
        this.popupWindow.postMessage({
          type: 'volume',
          data: { volume: this.currentVolume }
        }, '*');
      } catch (error) {
        console.warn('Could not send volume message to popup:', error);
      }
    }
    console.log(`🎵 YouTube volume set to: ${this.currentVolume}%`);
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

  // Reset user preferences
  resetUserPreferences() {
    localStorage.removeItem('youtube_preferred_method');
    localStorage.removeItem('youtube_preferred_method_index');
    this.currentFallbackIndex = 0;
    console.log('🎵 Reset YouTube user preferences');
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

export var popupYouTubePlayer = new PopupYouTubePlayer();