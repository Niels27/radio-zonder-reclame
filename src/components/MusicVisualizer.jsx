// components/MusicVisualizer.jsx - Beautiful, responsive music visualizer with real audio analysis
import React, { useEffect, useRef } from 'react';

// Global audio context and source management to prevent duplicate connections
const globalAudioManager = {
  audioContext: null,
  audioSources: new Map(), // Map of audio element to source node
  
  getOrCreateAudioContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  },
  
  getOrCreateSource(audioElement) {
    if (this.audioSources.has(audioElement)) {
      return this.audioSources.get(audioElement);
    }
    
    try {
      const audioContext = this.getOrCreateAudioContext();
      const source = audioContext.createMediaElementSource(audioElement);
      this.audioSources.set(audioElement, source);
      return source;
    } catch (error) {
      console.warn('Failed to create media element source:', error);
      return null;
    }
  },
  
  cleanup() {
    this.audioSources.clear();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
  }
};

// ========== ENHANCED VISUALIZER SETTINGS ==========
const VISUALIZER_SETTINGS = {
  bars: {
    count: 64,
    minHeight: 3,
    maxHeight: 80,
    width: 0.8,
    spacing: 0.3,
    smoothing: 0.7,
    responsiveness: 1.5,
    glow: 8,
    colors: {
      low: '#34d399',
      mid: '#60a5fa',
      high: '#a78bfa'
    }
  },
  wavy: {
    layers: 4,
    amplitude: 35,
    frequency: 0.018,
    speed: 1.5,
    flowiness: 1.0,
    audioResponse: 0.8,
    particleCount: 8,
    colors: ['#34d399', '#60a5fa', '#a78bfa', '#f472b6']
  },
  electric: {
    points: 80,
    sharpness: 6,
    amplitude: 45,
    speed: 2.5,
    audioResponse: 1.2,
    mirrorLayers: 3,
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
  }
};

const MusicVisualizer = ({ 
  isPlaying, 
  isEnabled, 
  visualizerType = 'bars',
  position = 'top'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const frequencyDataRef = useRef(new Uint8Array(256));
  const smoothingDataRef = useRef([]);
  const prevFrequencyDataRef = useRef([]);
  const setupCompleteRef = useRef(false);

  // Helper to get frequency ranges with proper mapping
  const getFrequencyRanges = (frequencyData) => {
    const bassEnd = Math.max(1, Math.floor(frequencyData.length * 0.15));
    const midEnd = Math.max(bassEnd + 1, Math.floor(frequencyData.length * 0.6));
    
    const bassData = frequencyData.slice(0, bassEnd);
    const midData = frequencyData.slice(bassEnd, midEnd);
    const trebleData = frequencyData.slice(midEnd);
    
    const bass = bassData.length > 0 ? bassData.reduce((a, b) => a + b, 0) / bassData.length / 255 : 0;
    const mid = midData.length > 0 ? midData.reduce((a, b) => a + b, 0) / midData.length / 255 : 0;
    const treble = trebleData.length > 0 ? trebleData.reduce((a, b) => a + b, 0) / trebleData.length / 255 : 0;
    
    return { 
      bass: Math.max(0, Math.min(1, bass)), 
      mid: Math.max(0, Math.min(1, mid)), 
      treble: Math.max(0, Math.min(1, treble)) 
    };
  };

  // ========== ENHANCED WAVY VISUALIZER ==========
 const renderWavyVisualizer = (ctx, width, height, time, frequencyData) => {
  const settings = VISUALIZER_SETTINGS.wavy;
  const centerY = height / 2;
  
  // Get ACTUAL frequency ranges
  const { bass, mid, treble } = getFrequencyRanges(frequencyData);
  
  // Draw one wave per frequency range - NO TIME ANIMATIONS
  const ranges = [
    { freq: bass, color: settings.colors[0], offset: -20 },
    { freq: mid, color: settings.colors[1], offset: 0 },
    { freq: treble, color: settings.colors[2], offset: 20 }
  ];
  
  ranges.forEach((range, idx) => {
    ctx.strokeStyle = range.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    
    const points = 100;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const xNorm = i / points;
      
      // Get frequency for this X position
      const freqIndex = Math.floor(xNorm * frequencyData.length);
      const localFreq = (frequencyData[freqIndex] || 0) / 255;
      
      // Wave height based ONLY on frequency data
      const waveHeight = localFreq * settings.amplitude * range.freq;
      const y = centerY + range.offset + (Math.random() * 2 - 1) * waveHeight;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  });
  
  ctx.globalAlpha = 1;
};

  // ========== ENHANCED BARS VISUALIZER ==========
const renderBarsVisualizer = (ctx, width, height, time, frequencyData) => {
  const settings = VISUALIZER_SETTINGS.bars;
  const barCount = Math.min(settings.count, Math.floor(width / 8));
  const barWidth = width / barCount;
  const barSpacing = barWidth * 0.1;
  const actualBarWidth = barWidth - barSpacing;
  
  // Initialize smoothing if needed
  if (smoothingDataRef.current.length !== barCount) {
    smoothingDataRef.current = new Array(barCount).fill(0);
  }
  
  for (let i = 0; i < barCount; i++) {
    // Map bars logarithmically across frequency spectrum
    const freqIndex = Math.floor(Math.pow(i / barCount, 2) * frequencyData.length * 0.75);
    const value = (frequencyData[freqIndex] || 0) / 255;
    
    // Simple smoothing - NO TIME-BASED ANIMATION
    const targetHeight = value;
    const currentHeight = smoothingDataRef.current[i];
    
    if (targetHeight > currentHeight) {
      // Fast rise
      smoothingDataRef.current[i] = targetHeight;
    } else {
      // Slow fall
      smoothingDataRef.current[i] = currentHeight * 0.9;
    }
    
    // Draw bar based ONLY on frequency data
    const barHeight = smoothingDataRef.current[i] * settings.maxHeight;
    
    if (barHeight > settings.minHeight) {
      // Color based on position (bass=green, mid=blue, treble=purple)
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
  // ========== ENHANCED ELECTRIC VISUALIZER ==========
const renderElectricWaveVisualizer = (ctx, width, height, time, frequencyData) => {
  const settings = VISUALIZER_SETTINGS.electric;
  const centerY = height / 2;
  
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  
  // Upper spikes
  ctx.beginPath();
  const points = Math.floor(width / 5); // One spike every 5 pixels
  
  for (let i = 0; i < points; i++) {
    const x = (i / points) * width;
    const freqIndex = Math.floor((i / points) * frequencyData.length * 0.7);
    const amplitude = (frequencyData[freqIndex] || 0) / 255;
    
    // Direct spike based on frequency
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
  // Enhanced audio context setup with better detection and retry logic
  useEffect(() => {
    if (!isPlaying || !isEnabled) return;

    let mounted = true;
    let retryTimeout = null;    const setupAudioContext = async () => {
      try {
        // Check both DOM elements and global audioPlayer elements
        const domAudioElements = Array.from(document.querySelectorAll('audio, video'));
        const globalAudioElements = [];
        
        // Add global audioPlayer elements if available
        if (window.audioPlayer?.audioElement) {
          globalAudioElements.push(window.audioPlayer.audioElement);
        }
        if (window.audioPlayer?.youtubeElement) {
          globalAudioElements.push(window.audioPlayer.youtubeElement);
        }
        if (window.audioPlayer?.spotifyElement) {
          globalAudioElements.push(window.audioPlayer.spotifyElement);
        }
        
        const allAudioElements = [...domAudioElements, ...globalAudioElements];
        let targetElement = null;
        
        console.log(`🎵 MusicVisualizer: Found ${domAudioElements.length} DOM audio/video elements, ${globalAudioElements.length} global elements`);
        
        // First, try to find any playing element
        for (const element of allAudioElements) {
          if (!element) continue; // Skip null elements
          
          console.log(`🔍 Checking element:`, {
            tagName: element.tagName || 'Unknown',
            paused: element.paused,
            currentTime: element.currentTime,
            src: element.src?.substring(0, 50) + '...',
            readyState: element.readyState,
            networkState: element.networkState,
            isGlobal: globalAudioElements.includes(element)
          });
          
          if (!element.paused && element.currentTime > 0 && element.readyState >= 2) {
            targetElement = element;
            console.log(`✅ Selected audio element:`, element.tagName || 'Global Audio', element.src?.substring(0, 50) + '...');
            break;
          }
        }
        
        // Fallback: use any element that has a source and isn't explicitly paused
        if (!targetElement) {
          for (const element of allAudioElements) {
            if (!element) continue;
            if (element.src && element.readyState >= 1) {
              targetElement = element;
              console.log(`🔄 Fallback audio element:`, element.tagName || 'Global Audio', element.src?.substring(0, 50) + '...');
              break;
            }
          }
        }
        
        // Special case: if we have a global radio audio element that's not paused, use it
        if (!targetElement && window.audioPlayer?.audioElement && window.audioPlayer.currentSource === 'radio') {
          const radioElement = window.audioPlayer.audioElement;
          if (radioElement && radioElement.src) {
            targetElement = radioElement;
            console.log(`🔄 Using global radio element:`, radioElement.src?.substring(0, 50) + '...');
          }
        }        if (targetElement && mounted) {
          // Check if we can reuse the global audio context
          const existingAudioContext = globalAudioManager.audioContext;
          if (existingAudioContext && existingAudioContext.state !== 'closed' && !audioContextRef.current) {
            console.log(`🔄 Reusing existing global audio context for:`, targetElement.tagName);
            
            // Create a new analyser for this component instance
            const analyser = existingAudioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
            analyser.minDecibels = -85;
            analyser.maxDecibels = -15;
            
            // Get the existing source from global manager
            const source = globalAudioManager.getOrCreateSource(targetElement);
            if (source) {
              try {
                source.connect(analyser);
                analyser.connect(existingAudioContext.destination);
                
                // Set up component references
                audioContextRef.current = existingAudioContext;
                analyserRef.current = analyser;
                frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
                prevFrequencyDataRef.current = new Array(analyser.frequencyBinCount).fill(0);
                
                console.log(`✅ MusicVisualizer reused audio context successfully!`);
                return;
              } catch (connectionError) {
                console.warn(`⚠️ Failed to connect to existing audio context:`, connectionError.message);
              }
            }
          }
          
          // If reusing failed, create new setup
          console.log(`🎧 Setting up new audio context for:`, targetElement.tagName);
          
          // Use global audio manager to prevent duplicate connections
          const audioContext = globalAudioManager.getOrCreateAudioContext();
          
          if (audioContext.state === 'suspended') {
            console.log(`🔓 Resuming suspended audio context`);
            await audioContext.resume();
          }
          
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.8;
          analyser.minDecibels = -85;
          analyser.maxDecibels = -15;
          
          // Use global audio manager to get or create source
          const source = globalAudioManager.getOrCreateSource(targetElement);
          if (!source) {
            console.warn(`⚠️ Failed to get audio source for element`);
            return;
          }
          
          // Connect the source to the analyser
          try {
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            console.log(`🎵 Audio context connected successfully!`);
          } catch (connectionError) {
            console.warn(`⚠️ Failed to connect audio nodes:`, connectionError.message);
            return;
          }
          
          if (mounted) {
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
            prevFrequencyDataRef.current = new Array(analyser.frequencyBinCount).fill(0);
            
            console.log(`✅ MusicVisualizer audio context setup complete! FFT Size: ${analyser.fftSize}, Bins: ${analyser.frequencyBinCount}`);
          }
        } else if (!targetElement) {
          console.log(`⏳ No suitable audio element found, retrying in 1 second...`);
          // Retry after 1 second if no audio element found
          if (mounted) {
            retryTimeout = setTimeout(() => {
              if (mounted && isPlaying && isEnabled) {
                setupAudioContext();
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('❌ Audio context setup failed:', error.message);
        console.log('🔄 Will retry audio context setup in 2 seconds...');
        
        // Retry after 2 seconds on error
        if (mounted) {
          retryTimeout = setTimeout(() => {
            if (mounted && isPlaying && isEnabled) {
              setupAudioContext();
            }
          }, 2000);
        }
      }
    };

    // Initial setup
    setupAudioContext();
    
    // Also try to setup when audio elements might be added dynamically
    const observer = new MutationObserver((mutations) => {
      let audioAdded = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.tagName === 'AUDIO' || node.tagName === 'VIDEO')) {
            audioAdded = true;
          }
        });
      });
      
      if (audioAdded && mounted && isPlaying && isEnabled && !audioContextRef.current) {
        console.log('🔄 New audio element detected, attempting setup...');
        setTimeout(setupAudioContext, 500); // Small delay to let element initialize
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      observer.disconnect();
    };
  }, [isPlaying, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !isPlaying) {
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
      if (!isPlaying || !isEnabled) return;

      try {
        timeRef.current += 0.016;
        const time = timeRef.current;
        
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        
        let frequencyData = frequencyDataRef.current;
        let hasRealAudio = false;
          if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(frequencyData);
          hasRealAudio = frequencyData.some(val => val > 0);
          
          // Log audio data status every few seconds for debugging
          if (Math.floor(time) % 3 === 0 && Math.floor(time * 60) % 60 === 0) {
            const avgLevel = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;
        //    console.log(`🎵 Audio data: hasRealAudio=${hasRealAudio}, avgLevel=${avgLevel.toFixed(1)}, maxLevel=${Math.max(...frequencyData)}`);
          }
        }
        
        // If no real audio data, provide a subtle fallback visualization
        if (!hasRealAudio) {
          console.log('⚠️ No real audio data detected, using minimal fallback');
          // Create minimal fallback data so visualizers still show something
          for (let i = 0; i < frequencyData.length; i++) {
            // Very subtle, low-level visualization
            const ratio = i / frequencyData.length;
            let intensity = 0;
            
            if (ratio < 0.3) {
              intensity = Math.sin(time * 0.8) * 0.15 + 0.05; // Bass range
            } else if (ratio < 0.7) {
              intensity = Math.sin(time * 1.2) * 0.1 + 0.03; // Mid range
            } else {
              intensity = Math.sin(time * 1.8) * 0.05 + 0.02; // High range
            }
            
            frequencyData[i] = Math.max(0, intensity * 128); // Lower amplitude fallback
          }
        }

        ctx.clearRect(0, 0, width, height);

        switch (visualizerType) {
           case 'bars':
            renderBarsVisualizer(ctx, width, height, time, frequencyData);
            break;
          case 'wavy':
            renderBarsVisualizer(ctx, width, height, time, frequencyData);
            break;
          case 'electric':
            renderBarsVisualizer(ctx, width, height, time, frequencyData);
            break;
          case 'none':
            return;
          default:
            renderBarsVisualizer(ctx, width, height, time, frequencyData);
        }

        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Visualizer animation error:', error);
        setTimeout(() => {
          if (isPlaying && isEnabled && visualizerType !== 'none') {
            animationRef.current = requestAnimationFrame(animate);
          }
        }, 100);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };  }, [isPlaying, isEnabled, visualizerType]);
  // Cleanup component references when unmounting (but keep global audio context)
  useEffect(() => {
    return () => {
      // Only clean up local references, not the global audio context
      audioContextRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  if (!isEnabled || !isPlaying || visualizerType === 'none') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none music-visualizer ${position === 'bottom' ? 'bottom' : ''}`}
      style={{ 
        zIndex: position === 'bottom' ? 0 : 10,
        mixBlendMode: position === 'bottom' ? 'screen' : 'normal'
      }}
    />
  );
};

// Debug helper functions - expose to console for testing
if (typeof window !== 'undefined') {window.debugMusicVisualizer = {
    // Test audio element detection
    testAudioDetection: () => {
      const domAudioElements = Array.from(document.querySelectorAll('audio, video'));
      const globalAudioElements = [];
      
      // Add global audioPlayer elements if available
      if (window.audioPlayer?.audioElement) {
        globalAudioElements.push(window.audioPlayer.audioElement);
      }
      if (window.audioPlayer?.youtubeElement) {
        globalAudioElements.push(window.audioPlayer.youtubeElement);
      }
      
      console.log(`🔍 Found ${domAudioElements.length} DOM audio/video elements, ${globalAudioElements.length} global elements`);
      console.log('Global audioPlayer state:', {
        currentSource: window.audioPlayer?.currentSource,
        isPlaying: window.audioPlayer?.isPlaying,
        hasAudioElement: !!window.audioPlayer?.audioElement,
        hasYoutubeElement: !!window.audioPlayer?.youtubeElement,
        hasSpotifyElement: !!window.audioPlayer?.spotifyElement
      });
      
      const allElements = [...domAudioElements, ...globalAudioElements];
      
      allElements.forEach((element, index) => {
        if (!element) return;
        console.log(`Element ${index}:`, {
          tagName: element.tagName || 'Global Audio',
          paused: element.paused,
          currentTime: element.currentTime,
          src: element.src?.substring(0, 80) + '...',
          readyState: element.readyState,
          networkState: element.networkState,
          volume: element.volume,
          muted: element.muted,
          isGlobal: globalAudioElements.includes(element)
        });
      });
      
      return { domElements: domAudioElements, globalElements: globalAudioElements };
    },
      // Force audio context creation
    forceAudioContextSetup: async () => {
      try {
        const domAudioElements = Array.from(document.querySelectorAll('audio, video'));
        const globalAudioElements = [];
        
        if (window.audioPlayer?.audioElement) {
          globalAudioElements.push(window.audioPlayer.audioElement);
        }
        
        const allElements = [...domAudioElements, ...globalAudioElements];
        const playingElement = allElements.find(el => 
          el && !el.paused && el.currentTime > 0
        );
        
        // Fallback to global radio element if available
        const fallbackElement = window.audioPlayer?.audioElement && window.audioPlayer.currentSource === 'radio' 
          ? window.audioPlayer.audioElement 
          : null;
          
        const targetElement = playingElement || fallbackElement;
        
        if (!targetElement) {
          console.log('❌ No suitable audio element found');
          console.log('Available elements:', allElements.map(el => ({
            tagName: el?.tagName,
            paused: el?.paused,
            src: el?.src?.substring(0, 50)
          })));
          return false;
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        const source = audioContext.createMediaElementSource(targetElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        console.log('✅ Forced audio context created successfully!');
        return { audioContext, analyser, element: targetElement };
      } catch (error) {
        console.error('❌ Failed to force audio context setup:', error);
        return false;
      }
    },
    
    // Test audio data reading
    testAudioData: () => {
      const audioElements = document.querySelectorAll('audio, video');
      audioElements.forEach((element, index) => {
        if (!element.paused && element.currentTime > 0) {
          console.log(`🎵 Testing audio data for element ${index}...`);
          
          // This is just for testing - in practice, we'd need the analyser
          console.log({
            playing: !element.paused,
            currentTime: element.currentTime,
            duration: element.duration,
            volume: element.volume,
            readyState: element.readyState,
            crossOrigin: element.crossOrigin
          });
        }      });
    }
  };
}

// Named export for compatibility
export { MusicVisualizer };
// Default export
export default MusicVisualizer;

// Cleanup global audio manager when page is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalAudioManager.cleanup();
  });
}
