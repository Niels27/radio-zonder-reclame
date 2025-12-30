// components/MusicVisualizerSingle.jsx - Single instance music visualizer with DOM movement
import React, { useEffect, useRef } from 'react';

// Global singleton audio manager - only one instance across the entire app
const globalAudioManager = {
  audioContext: null,
  analyser: null,
  source: null,
  frequencyData: null,
  isSetup: false,
  
  async setup() {
    if (this.isSetup) return true;

    try {
      // Get audio element from AudioManager
      let targetElement = null;

      if (window.audioManager) {
        targetElement = window.audioManager.getAudioElement();
      }

      // Fallback: search DOM for audio elements
      if (!targetElement) {
        const domAudioElements = Array.from(document.querySelectorAll('audio'));
        for (const element of domAudioElements) {
          if (!element) continue;
          if (!element.paused && element.currentTime > 0 && element.readyState >= 2) {
            targetElement = element;
            break;
          }
        }
      }

      if (!targetElement) {
        console.log('🎵 No suitable audio element found');
        return false;
      }

      console.log('✅ Found audio element for visualizer:', targetElement);
      
      // Create audio context ONCE
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create analyser ONCE
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -85;
      this.analyser.maxDecibels = -15;
      
      // Create source ONCE
      this.source = this.audioContext.createMediaElementSource(targetElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Create frequency data array ONCE
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.isSetup = true;
      console.log('✅ Global audio manager setup complete');
      return true;
    } catch (error) {
      console.error('❌ Global audio manager setup failed:', error);
      return false;
    }
  },
  
  getFrequencyData() {
    if (!this.isSetup || !this.analyser || !this.frequencyData) return null;
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  },
  
  cleanup() {
    this.isSetup = false;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.frequencyData = null;
  }
};

// Visualizer settings
const VISUALIZER_SETTINGS = {
  bars: {
    count: 64,
    minHeight: 3,
    maxHeight: 80,
    colors: {
      low: '#34d399',
      mid: '#60a5fa',
      high: '#a78bfa'
    }
  },
  wavy: {
    amplitude: 35,
    colors: ['#34d399', '#60a5fa', '#a78bfa', '#f472b6']
  },
  electric: {
    amplitude: 45,
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
  }
};

const MusicVisualizerSingle = ({ 
  isPlaying, 
  isEnabled, 
  visualizerType = 'bars',
  position = 'header',
  currentSource = 'radio'
}) => {  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const smoothingDataRef = useRef([]);
  const setupAttemptedRef = useRef(false);
  const animationStartTimeRef = useRef(null); // For fake bars visualization timing
  // Setup audio context once when component mounts and audio is playing (only for radio)
  useEffect(() => {
    if (!isPlaying || !isEnabled || setupAttemptedRef.current) return;
    
    // Only attempt audio setup for radio sources
    if (currentSource !== 'radio') return;
    
    setupAttemptedRef.current = true;
    
    const attemptSetup = async () => {
      const success = await globalAudioManager.setup();
      if (!success) {
        // Retry after 2 seconds
        setTimeout(() => {
          setupAttemptedRef.current = false;
        }, 2000);
      }
    };
    
    attemptSetup();
  }, [isPlaying, isEnabled, currentSource]);

  // Animation loop
  useEffect(() => {
    if (!isEnabled || !isPlaying || visualizerType === 'none') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);    const animate = () => {
      if (!isPlaying || !isEnabled) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Initialize animation start time for fake visualizations
      if (animationStartTimeRef.current === null) {
        animationStartTimeRef.current = Date.now();
      }
      
      ctx.clearRect(0, 0, width, height);      // Try to get real audio analysis data first
      const frequencyData = globalAudioManager.getFrequencyData();

      if (frequencyData) {
        // REAL VISUALIZATION with bars (always prefer real data when available)
        renderBarsVisualizer(ctx, width, height, frequencyData);
      } else {
        // FAKE VISUALIZATION only when no real audio data available
        const elapsedTime = (Date.now() - animationStartTimeRef.current) / 1000;
        renderFakeBarsVisualizer(ctx, width, height, elapsedTime);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isEnabled, visualizerType, currentSource]);

  // Bars visualizer
  const renderBarsVisualizer = (ctx, width, height, frequencyData) => {
    const settings = VISUALIZER_SETTINGS.bars;
    const barCount = Math.min(settings.count, Math.floor(width / 8));
    const barWidth = width / barCount;
    const barSpacing = barWidth * 0.1;
    const actualBarWidth = barWidth - barSpacing;
    
    if (smoothingDataRef.current.length !== barCount) {
      smoothingDataRef.current = new Array(barCount).fill(0);
    }
    
    for (let i = 0; i < barCount; i++) {
      const freqIndex = Math.floor(Math.pow(i / barCount, 2) * frequencyData.length * 0.75);
      const value = (frequencyData[freqIndex] || 0) / 255;
      
      const targetHeight = value;
      const currentHeight = smoothingDataRef.current[i];
      
      if (targetHeight > currentHeight) {
        smoothingDataRef.current[i] = targetHeight;
      } else {
        smoothingDataRef.current[i] = currentHeight * 0.9;
      }
      
      const barHeight = smoothingDataRef.current[i] * settings.maxHeight;
      
      if (barHeight > settings.minHeight) {
        const colorRatio = i / barCount;
        let color;
        if (colorRatio < 0.33) color = settings.colors.low;
        else if (colorRatio < 0.66) color = settings.colors.mid;
        else color = settings.colors.high;
        
        const x = i * barWidth + barSpacing / 2;
        const y = height - barHeight;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }
    }
  };

  // Wavy visualizer
  const renderWavyVisualizer = (ctx, width, height, frequencyData) => {
    const settings = VISUALIZER_SETTINGS.wavy;
    const centerY = height / 2;
    
    const getFrequencyRanges = (data) => {
      const bassEnd = Math.floor(data.length * 0.15);
      const midEnd = Math.floor(data.length * 0.6);
      
      const bass = data.slice(0, bassEnd).reduce((a, b) => a + b, 0) / bassEnd / 255;
      const mid = data.slice(bassEnd, midEnd).reduce((a, b) => a + b, 0) / (midEnd - bassEnd) / 255;
      const treble = data.slice(midEnd).reduce((a, b) => a + b, 0) / (data.length - midEnd) / 255;
      
      return { bass, mid, treble };
    };
    
    const { bass, mid, treble } = getFrequencyRanges(frequencyData);
    
    const ranges = [
      { freq: bass, color: settings.colors[0], offset: -20 },
      { freq: mid, color: settings.colors[1], offset: 0 },
      { freq: treble, color: settings.colors[2], offset: 20 }
    ];
    
    ranges.forEach((range) => {
      ctx.strokeStyle = range.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      
      for (let i = 0; i <= 100; i++) {
        const x = (i / 100) * width;
        const xNorm = i / 100;
        const freqIndex = Math.floor(xNorm * frequencyData.length);
        const localFreq = (frequencyData[freqIndex] || 0) / 255;
        const waveHeight = localFreq * settings.amplitude * range.freq;
        const y = centerY + range.offset + (Math.random() * 2 - 1) * waveHeight;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
  };

  // Electric visualizer
  const renderElectricVisualizer = (ctx, width, height, frequencyData) => {
    const settings = VISUALIZER_SETTINGS.electric;
    const centerY = height / 2;
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    
    // Upper spikes
    ctx.beginPath();
    const points = Math.floor(width / 5);
    
    for (let i = 0; i < points; i++) {
      const x = (i / points) * width;
      const freqIndex = Math.floor((i / points) * frequencyData.length * 0.7);
      const amplitude = (frequencyData[freqIndex] || 0) / 255;
      const spikeHeight = amplitude * settings.amplitude;
      const y = centerY - spikeHeight;
      
      if (i === 0) ctx.moveTo(x, centerY);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 2, centerY);
    }
    
    ctx.stroke();
    
    // Lower spikes (mirrored)
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const x = (i / points) * width;
      const freqIndex = Math.floor((i / points) * frequencyData.length * 0.7);
      const amplitude = (frequencyData[freqIndex] || 0) / 255;
      const spikeHeight = amplitude * settings.amplitude;
      const y = centerY + spikeHeight;
      
      if (i === 0) ctx.moveTo(x, centerY);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 2, centerY);
    }
      ctx.stroke();
  };
  // Fake bars visualizer - animated bars with musical timing for when no real audio data
  const renderFakeBarsVisualizer = (ctx, width, height, elapsedTime) => {
    const settings = VISUALIZER_SETTINGS.bars;
    const barCount = Math.min(settings.count, Math.floor(width / 8));
    const barWidth = width / barCount;
    const barSpacing = barWidth * 0.1;
    const actualBarWidth = barWidth - barSpacing;

    for (let i = 0; i < barCount; i++) {
      const barPosition = i / barCount;

      // Create musical-feeling animation with multiple sine waves
      // Bass frequencies (low bars)
      const bassWave = Math.sin(elapsedTime * 0.5 + barPosition * Math.PI) * 0.3;

      // Mid frequencies
      const midWave = Math.sin(elapsedTime * 1.2 + barPosition * Math.PI * 2) * 0.5;

      // High frequencies (high bars)
      const trebleWave = Math.sin(elapsedTime * 2.0 + barPosition * Math.PI * 4) * 0.4;

      // Tempo variation (like song dynamics)
      const tempo = Math.sin(elapsedTime * 0.3) * 0.2 + 0.8;

      // Combine waves based on bar position (bass = left, treble = right)
      let combinedValue;
      if (barPosition < 0.33) {
        // Bass-heavy for left side
        combinedValue = (bassWave * 0.7 + midWave * 0.2 + trebleWave * 0.1) * tempo;
      } else if (barPosition < 0.66) {
        // Mid-heavy for middle
        combinedValue = (bassWave * 0.2 + midWave * 0.6 + trebleWave * 0.2) * tempo;
      } else {
        // Treble-heavy for right side
        combinedValue = (bassWave * 0.1 + midWave * 0.2 + trebleWave * 0.7) * tempo;
      }

      // Normalize to 0-1 range
      const normalizedValue = (combinedValue + 1) / 2;

      // Add some randomness for organic feel
      const randomFactor = Math.random() * 0.15 + 0.85;
      const finalValue = normalizedValue * randomFactor;

      const barHeight = finalValue * settings.maxHeight;

      if (barHeight > settings.minHeight) {
        const colorRatio = i / barCount;
        let color;
        if (colorRatio < 0.33) color = settings.colors.low;
        else if (colorRatio < 0.66) color = settings.colors.mid;
        else color = settings.colors.high;

        const x = i * barWidth + barSpacing / 2;
        const y = height - barHeight;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }
    }
  };  // Reset animation timer when source changes
  useEffect(() => {
    animationStartTimeRef.current = null;
    // Reset setup attempt when switching sources
    setupAttemptedRef.current = false;
  }, [currentSource]);

  if (!isEnabled || !isPlaying || visualizerType === 'none') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none music-visualizer ${position === 'footer' ? 'footer' : ''}`}
      style={{ 
        zIndex: position === 'footer' ? 0 : 10,
        mixBlendMode: position === 'footer' ? 'screen' : 'normal'
      }}
    />
  );
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalAudioManager.cleanup();
  });
}

export default MusicVisualizerSingle;
