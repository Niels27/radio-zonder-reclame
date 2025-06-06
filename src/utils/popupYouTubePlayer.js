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
    this.currentFallbackIndex = 0; // Track which fallback we're using
    this.fallbackMethods = [
      'nocookie_embed',
      'regular_embed', 
      'direct_playlist',
      'mobile_embed'
    ];
  }

  // Get the appropriate URL based on fallback method
  getYouTubeUrl(playlistId, method = 'nocookie_embed') {
    var shuffleParam = this.isShuffled ? '&shuffle=1' : '';
    var origin = encodeURIComponent(window.location.origin);
    var referrer = encodeURIComponent(window.location.href);
    
    switch (method) {
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
        return `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1`;
        
      case 'mobile_embed':
        return `https://m.youtube.com/playlist?list=${playlistId}&autoplay=1`;
        
      default:
        return this.getYouTubeUrl(playlistId, 'nocookie_embed');
    }
  }

  // Get method display name
  getMethodDisplayName(method) {
    switch (method) {
      case 'nocookie_embed': return 'Privacy Mode (Aanbevolen)';
      case 'regular_embed': return 'Standaard Embed';
      case 'direct_playlist': return 'Direct YouTube Link';
      case 'mobile_embed': return 'Mobiele Versie';
      default: return method;
    }
  }

  async playPlaylist(playlistId, options = {}) {
    console.log('🎵 Starting YouTube playlist with fallback options:', playlistId);
    
    this.currentPlaylistId = playlistId;
    this.isShuffled = options.shuffle || false;
    
    // Reset fallback index unless specifically requested
    if (!options.useFallback) {
      this.currentFallbackIndex = 0;
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
      // Popup dimensions and position
      var width = 854;
      var height = 480;
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
        `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
      );
      
      if (!this.popupWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Enhanced HTML with fallback buttons
      this.popupWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>🎵 YouTube Playlist Player</title>
          <meta name="referrer" content="no-referrer-when-downgrade">
          <meta name="robots" content="noindex, nofollow">
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
              position: relative;
              z-index: 1000;
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
            .close-btn, .fallback-btn { 
              background: #ff4444; 
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 4px; 
              cursor: pointer; 
              font-size: 11px; 
              transition: background 0.2s;
              margin-left: 5px;
            }
            .fallback-btn {
              background: #ff8800;
              font-size: 10px;
              padding: 4px 8px;
            }
            .close-btn:hover { background: #ff6666; }
            .fallback-btn:hover { background: #ffaa33; }
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
              z-index: 100;
            }
            .method-info {
              font-size: 9px;
              opacity: 0.7;
              margin-left: 10px;
            }
            .error-message {
              position: absolute;
              top: 60%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #ff6666;
              text-align: center;
              z-index: 200;
              background: rgba(0,0,0,0.8);
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #ff6666;
              display: none;
              max-width: 80%;
            }
            .fallback-buttons {
              margin-top: 15px;
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: center;
            }
            .fallback-buttons button {
              background: #4CAF50;
              color: white;
              border: none;
              padding: 8px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 12px;
              transition: background 0.2s;
            }
            .fallback-buttons button:hover {
              background: #45a049;
            }
            .fallback-buttons button:disabled {
              background: #666;
              cursor: not-allowed;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span>🎵 Reclamepauze Muziek</span>
              <span class="method-info">(${this.getMethodDisplayName(currentMethod)})</span>
              <div class="status">
                <span class="pulse">●</span>
                <span>Actief</span>
              </div>
            </div>
            <div>
              <button class="fallback-btn" onclick="showFallbackOptions()" title="Probeer andere methode">🔄 Andere methode</button>
              <button class="close-btn" onclick="closePlayer()" title="Sluit muziek">✕</button>
            </div>
          </div>
          <div id="loading" class="loading">
            <div>🎵 Loading YouTube playlist...</div>
            <div style="font-size: 11px; margin-top: 10px; opacity: 0.7;">Methode: ${this.getMethodDisplayName(currentMethod)}</div>
          </div>
          
          <!-- Error message with fallback options -->
          <div id="error-message" class="error-message">
            <div style="font-size: 16px; margin-bottom: 10px;">🚫 YouTube blokkeert deze methode</div>
            <div style="font-size: 12px; margin-bottom: 15px;">
              Dit kan gebeuren vanwege bot-detectie of blokkering van embeds.<br>
              Probeer een andere methode:
            </div>
            <div class="fallback-buttons" id="fallback-buttons">
              <!-- Buttons will be added by JavaScript -->
            </div>
          </div>
          
          <iframe 
            id="player"
            src="${youtubeUrl}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            loading="eager"
            onload="hideLoading()"
            onerror="handleError()">
          </iframe>
          
          <script>
            var currentMethodIndex = ${this.currentFallbackIndex};
            var methods = ${JSON.stringify(this.fallbackMethods)};
            var methodNames = ${JSON.stringify(this.fallbackMethods.map(m => this.getMethodDisplayName(m)))};
            var playlistId = '${playlistId}';
            var botDetectionCheckCount = 0;
            var maxBotDetectionChecks = 10;
            
            function hideLoading() {
              document.getElementById('loading').style.display = 'none';
              
              // Start checking for bot detection after iframe loads
              setTimeout(checkForBotDetection, 3000);
            }
            
            function handleError() {
              console.error('YouTube iframe failed to load');
              showErrorWithFallbacks();
              
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'youtube_error',
                  error: 'iframe_load_failed',
                  method: methods[currentMethodIndex]
                }, '*');
              }
            }
            
            function checkForBotDetection() {
              if (botDetectionCheckCount >= maxBotDetectionChecks) return;
              botDetectionCheckCount++;
              
              var iframe = document.getElementById('player');
              try {
                // Try to access iframe content (will fail due to CORS, but that's expected)
                // The real check is if the iframe has loaded properly
                if (iframe.contentWindow) {
                  // Check if iframe is showing expected content or error
                  setTimeout(checkForBotDetection, 2000);
                }
              } catch (e) {
                // CORS error is expected, continue checking
                setTimeout(checkForBotDetection, 2000);
              }
              
              // Check for common YouTube error indicators in the URL or title
              try {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.title && 
                    (iframeDoc.title.includes('Sign in') || 
                     iframeDoc.title.includes('not a bot') ||
                     iframeDoc.title.includes('Confirm you'))) {
                  console.warn('Bot detection possibly detected');
                  showErrorWithFallbacks();
                  return;
                }
              } catch (e) {
                // Expected CORS error, ignore
              }
            }
            
            function showErrorWithFallbacks() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error-message').style.display = 'block';
              
              // Create fallback buttons
              var buttonsContainer = document.getElementById('fallback-buttons');
              buttonsContainer.innerHTML = '';
              
              methods.forEach(function(method, index) {
                if (index !== currentMethodIndex) {
                  var button = document.createElement('button');
                  button.textContent = methodNames[index];
                  button.onclick = function() { tryFallbackMethod(index); };
                  buttonsContainer.appendChild(button);
                }
              });
              
              // Add "Open in New Tab" option
              var newTabButton = document.createElement('button');
              newTabButton.textContent = '🔗 Open in nieuwe tab';
              newTabButton.style.background = '#2196F3';
              newTabButton.onclick = function() {
                window.open('https://www.youtube.com/playlist?list=' + playlistId, '_blank');
              };
              buttonsContainer.appendChild(newTabButton);
            }
            
            function showFallbackOptions() {
              showErrorWithFallbacks();
            }
            
            function tryFallbackMethod(methodIndex) {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'youtube_try_fallback',
                  methodIndex: methodIndex,
                  playlistId: playlistId
                }, '*');
              }
              closePlayer();
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
            window.addEventListener('message', function(event) {
              if (event.source !== window.opener) return;
              
              var data = event.data;
              console.log('YouTube popup received message:', data.type, data);
              
              switch(data.type) {
                case 'close':
                  closePlayer();
                  break;
                case 'volume':
                  console.log('Volume set to:', data.data.volume);
                  break;
                case 'shuffle':
                  console.log('Shuffle set to:', data.data.enabled);
                  break;
                case 'checkBotDetection':
                  checkForBotDetection();
                  break;
              }
            });
            
            // Notify parent when popup closes
            window.addEventListener('beforeunload', function() {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'youtube_popup_closed',
                  reason: 'user_close'
                }, '*');
              }
            });
            
            // Auto-focus iframe after load
            setTimeout(function() {
              var iframe = document.getElementById('player');
              if (iframe) {
                iframe.focus();
                hideLoading();
              }
            }, 2000);
            
            // Periodically check for bot detection
            setInterval(function() {
              if (botDetectionCheckCount < maxBotDetectionChecks) {
                checkForBotDetection();
              }
            }, 10000);
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
        console.log('🎵 YouTube popup closed:', event.data.reason);
        self.isPlaying = false;
        self.popupWindow = null;
        
        // Clear auto-close timeout if user manually closed
        if (self.autoCloseTimeout) {
          clearTimeout(self.autoCloseTimeout);
          self.autoCloseTimeout = null;
        }
        
        if (self.onCloseCallback) {
          self.onCloseCallback(event.data.reason || 'unknown');
        }
        window.removeEventListener('message', messageHandler);
        
      } else if (event.data.type === 'youtube_error') {
        console.error('🎵 YouTube popup error:', event.data.error);
        // Don't auto-retry anymore - let user choose fallback manually
        
      } else if (event.data.type === 'youtube_try_fallback') {
        console.log('🎵 User requested fallback method:', event.data.methodIndex);
        
        // Set the fallback method and restart
        self.currentFallbackIndex = event.data.methodIndex;
        
        setTimeout(() => {
          self.playPlaylist(event.data.playlistId, { 
            shuffle: self.isShuffled, 
            useFallback: true 
          });
        }, 500);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Enhanced popup monitoring
    var checkPopup = function() {
      if (self.popupWindow && self.popupWindow.closed) {
        console.log('🎵 YouTube popup was closed externally');
        self.isPlaying = false;
        self.popupWindow = null;
        
        // Clear auto-close timeout
        if (self.autoCloseTimeout) {
          clearTimeout(self.autoCloseTimeout);
          self.autoCloseTimeout = null;
        }
        
        if (self.onCloseCallback) {
          self.onCloseCallback('popup_closed');
        }
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
      console.log('🔄 Trying next fallback method:', this.fallbackMethods[this.currentFallbackIndex]);
      
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
      hasMoreFallbacks: this.currentFallbackIndex < this.fallbackMethods.length - 1
    };
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
    
    // Reset retry count but keep fallback index for next attempt
    this.retryCount = 0;
    
    // Notify callback with reason
    if (this.onCloseCallback && reason !== 'manual') {
      this.onCloseCallback(reason);
    }
  }

  // Enhanced control methods (rest remain the same)
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

export var popupYouTubePlayer = new PopupYouTubePlayer();