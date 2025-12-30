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
  const animationStartTimeRef = useRef(null); // For fake streaming visualization timing
  const particlesRef = useRef([]); // For dust particles in fake visualization
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
    // For YouTube/Spotify, show visualizer even if isPlaying is false (since they use overlay players)
    const shouldAnimate = currentSource === 'youtube' || currentSource === 'spotify' ? isEnabled : (isEnabled && isPlaying);

    if (!shouldAnimate || visualizerType === 'none') {
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
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      // For YouTube/Spotify, animate even if isPlaying is false
      const shouldContinue = currentSource === 'youtube' || currentSource === 'spotify' ? isEnabled : (isPlaying && isEnabled);
      if (!shouldContinue) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Initialize animation start time for fake visualizations
      if (animationStartTimeRef.current === null) {
        animationStartTimeRef.current = Date.now();
      }

      ctx.clearRect(0, 0, width, height);

      // Try to get real audio analysis data first
      const frequencyData = globalAudioManager.getFrequencyData();

      if (frequencyData) {
        // REAL VISUALIZATION with bars (always prefer real data when available)
        renderBarsVisualizer(ctx, width, height, frequencyData);
      } else {
        // FAKE VISUALIZATION: Use screensaver-style waves with dust particles for YouTube/Spotify
        const elapsedTime = (Date.now() - animationStartTimeRef.current) / 1000;
        renderFakeStreamingVisualizer(ctx, width, height, elapsedTime);
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
  // Fake streaming visualizer - 3 smooth waves with long-period fake music data + dust particles
  const renderFakeStreamingVisualizer = (ctx, width, height, elapsedTime) => {
    const centerY = height / 2;

    // Initialize particles if needed
    if (particlesRef.current.length === 0) {
      const particleCount = Math.floor((width * height) / 8000); // Density based on canvas size
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5, // 0.5 to 2.5px
          vx: (Math.random() - 0.5) * 20, // Slow horizontal drift
          vy: (Math.random() - 0.5) * 15, // Slow vertical drift
          opacity: Math.random() * 0.4 + 0.1, // 0.1 to 0.5 opacity
          life: Math.random() * 10 + 5 // 5-15 second lifecycle
        });
      }
    }

    // Create 3 waves with different characteristics for a rich, musical feel
    const waves = [
      {
        // Bass-like wave (slow, deep)
        color: '#34d399', // green
        amplitude: height * 0.15,
        frequency: 0.3, // slow oscillation
        phase: 0,
        offset: -height * 0.1,
        lineWidth: 3
      },
      {
        // Mid-range wave (medium speed, medium amplitude)
        color: '#60a5fa', // blue
        amplitude: height * 0.12,
        frequency: 0.7,
        phase: Math.PI / 3, // offset phase for variety
        offset: 0,
        lineWidth: 2.5
      },
      {
        // Treble-like wave (faster, lighter)
        color: '#a78bfa', // purple
        amplitude: height * 0.08,
        frequency: 1.2,
        phase: Math.PI * 2 / 3, // different phase offset
        offset: height * 0.08,
        lineWidth: 2
      }
    ];

    // Render waves
    waves.forEach((wave, waveIndex) => {
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = wave.lineWidth;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();

      // Create complex, musical-feeling wave patterns
      for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * width;
        const xNorm = i / 200;

        // Main wave component
        const mainWave = Math.sin(elapsedTime * wave.frequency + wave.phase + xNorm * Math.PI * 2);

        // Add harmonic for complexity (musical richness)
        const harmonic1 = Math.sin(elapsedTime * wave.frequency * 2.1 + wave.phase + xNorm * Math.PI * 4) * 0.3;
        const harmonic2 = Math.sin(elapsedTime * wave.frequency * 0.7 + wave.phase + xNorm * Math.PI * 1.5) * 0.5;

        // Add slow tempo variation (like a song's dynamics)
        const tempoVariation = Math.sin(elapsedTime * 0.1 + waveIndex) * 0.3 + 0.7; // 0.4 to 1.0 range

        // Add spatial variation along the width (like frequency response)
        const spatialVariation = Math.sin(xNorm * Math.PI * 3 + elapsedTime * 0.5) * 0.2 + 0.8;

        // Combine all components for a rich, musical wave
        const combinedAmplitude = (mainWave + harmonic1 + harmonic2) * tempoVariation * spatialVariation;
        const y = centerY + wave.offset + (combinedAmplitude * wave.amplitude);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    });

    // Update and render dust particles
    ctx.globalAlpha = 1;
    particlesRef.current.forEach((particle, index) => {
      // Update particle position
      particle.x += particle.vx * 0.016; // ~60fps timing
      particle.y += particle.vy * 0.016;
      particle.life -= 0.016;

      // Wrap around screen edges
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      // Respawn particle if life expired
      if (particle.life <= 0) {
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.size = Math.random() * 2 + 0.5;
        particle.vx = (Math.random() - 0.5) * 20;
        particle.vy = (Math.random() - 0.5) * 15;
        particle.opacity = Math.random() * 0.4 + 0.1;
        particle.life = Math.random() * 10 + 5;
      }

      // Draw particle
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  };  // Reset animation timer when source changes
  useEffect(() => {
    animationStartTimeRef.current = null;
    // Reset setup attempt when switching sources
    setupAttemptedRef.current = false;
    // Reset particles when switching visualization modes
    particlesRef.current = [];
  }, [currentSource]);

  // For YouTube/Spotify, show visualizer even if isPlaying is false (since they use overlay players)
  const shouldRender = currentSource === 'youtube' || currentSource === 'spotify' ? isEnabled : (isEnabled && isPlaying);

  if (!shouldRender || visualizerType === 'none') {
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
