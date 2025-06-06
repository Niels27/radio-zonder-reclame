// Create a new audio-only player that bypasses YouTube's embedding restrictions
export class AudioOnlyPlayer {
  constructor() {
    console.log('🎵 AudioOnlyPlayer constructor called');
    this.audioContext = null;
    this.currentSource = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  async initialize() {
    console.log('🎵 AudioOnlyPlayer.initialize() called');
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  async playPlaylist(playlistId, options = {}) {
    console.log('🎵 AudioOnlyPlayer.playPlaylist() called with:', playlistId, options);
    
    try {
      // Add your actual implementation here
      console.log('🎵 AudioOnlyPlayer attempting to play playlist...');
      
      // Method 1: Use YouTube's audio-only streams (requires YouTube API key)
      const audioStreams = await this.getAudioStreams(playlistId);
      
      if (audioStreams.length > 0) {
        const randomIndex = options.shuffle ? Math.floor(Math.random() * audioStreams.length) : 0;
        await this.playAudioStream(audioStreams[randomIndex]);
        return true;
      }
    } catch (error) {
      console.log('🎵 ❌ AudioOnlyPlayer.playPlaylist() error:', error);
    }
    
    return false;
  }

  async getAudioStreams(playlistId) {
    console.log('🎵 AudioOnlyPlayer.getAudioStreams() called with:', playlistId);
    // This would require a YouTube API key and backend proxy
    // For now, return empty array to fall back to other methods
    return [];
  }

  async playAudioStream(streamUrl) {
    console.log('🎵 AudioOnlyPlayer.playAudioStream() called with:', streamUrl);
    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = streamUrl;
      
      const source = this.audioContext.createMediaElementSource(audio);
      source.connect(this.gainNode);
      
      await audio.play();
      this.currentSource = audio;
      this.isPlaying = true;
      
      return true;
    } catch (error) {
      console.error('Failed to play audio stream:', error);
      return false;
    }
  }

  setVolume(volume) {
    console.log('🎵 AudioOnlyPlayer.setVolume() called with:', volume);
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  pause() {
    console.log('🎵 AudioOnlyPlayer.pause() called');
    if (this.currentSource) {
      this.currentSource.pause();
      this.isPlaying = false;
    }
  }

  resume() {
    console.log('🎵 AudioOnlyPlayer.resume() called');
    if (this.currentSource) {
      this.currentSource.play();
      this.isPlaying = true;
    }
  }
}