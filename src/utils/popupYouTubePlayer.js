class PopupYouTubePlayer {
  constructor() {
    this.popupWindow = null;
    this.currentPlaylistId = null;
    this.isPlaying = false;
    this.onCloseCallback = null;
  }

  async playPlaylist(playlistId, options = {}) {
    console.log('🎵 Opening YouTube playlist in popup:', playlistId);
    
    this.currentPlaylistId = playlistId;
    this.closePopup(); // Close existing popup if open
    
    // Popup dimensions and position
    const width = 480;
    const height = 360;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    // YouTube playlist URL with autoplay
    const youtubeUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&controls=1`;
    
    // Create popup window
    this.popupWindow = window.open(
      '',
      'youtubePlayer',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
    );
    
    if (!this.popupWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    // Write HTML content to popup
    this.popupWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>🎵 YouTube Playlist Player</title>
        <style>
          body { margin: 0; padding: 0; background: #000; font-family: Arial, sans-serif; }
          .header { background: #1a1a1a; color: white; padding: 8px 12px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
          .close-btn { background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; }
          .close-btn:hover { background: #ff6666; }
          iframe { width: 100%; height: calc(100vh - 32px); border: none; }
        </style>
      </head>
      <body>
        <div class="header">
          <span>🎵 Ad Break Playlist</span>
          <button class="close-btn" onclick="window.close()">×</button>
        </div>
        <iframe src="${youtubeUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <script>
          window.addEventListener('beforeunload', () => {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: 'youtube_popup_closed' }, '*');
            }
          });
        </script>
      </body>
      </html>
    `);
    
    this.popupWindow.document.close();
    this.isPlaying = true;
    this.setupPopupListeners();
    return true;
  }

  setupPopupListeners() {
    const messageHandler = (event) => {
      if (event.data.type === 'youtube_popup_closed') {
        this.isPlaying = false;
        this.popupWindow = null;
        if (this.onCloseCallback) this.onCloseCallback();
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    const checkPopup = () => {
      if (this.popupWindow && this.popupWindow.closed) {
        this.isPlaying = false;
        this.popupWindow = null;
        if (this.onCloseCallback) this.onCloseCallback();
        return;
      }
      if (this.isPlaying) setTimeout(checkPopup, 1000);
    };
    
    setTimeout(checkPopup, 1000);
  }

  closePopup() {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
      this.popupWindow = null;
      this.isPlaying = false;
    }
  }

  pause() { this.closePopup(); }
  resume() { if (this.currentPlaylistId) this.playPlaylist(this.currentPlaylistId); }
  onClose(callback) { this.onCloseCallback = callback; }
  destroy() { this.closePopup(); }
}

export const popupYouTubePlayer = new PopupYouTubePlayer();