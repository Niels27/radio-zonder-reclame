// Enhanced Music vs Ads Detection - Focus on Silence Patterns + Rhythm Analysis
// Ads have brief silences between them, music flows continuously with rhythm

// ✅ FIX: Global detector to avoid MediaElementSource conflicts
let globalDetector = null;

class MusicDetector {
  constructor() {
    this.model = null;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.isAnalyzing = false;
    this.detectionCallback = null;
    this.consecutiveNoMusicCount = 0;
    this.status = 'idle';
    this.lastDetectionTime = null;
    this.detectionHistory = [];

    // ✅ EXISTING: Enhanced silence detection properties
    this.silenceThreshold = 5; // RMS level below which we consider it "silence"
    this.silenceMinDuration = 0.5; // Minimum silence duration in seconds
    this.silenceMaxDuration = 3.0; // Maximum silence duration for ads (longer = music pause)
    this.consecutiveSilences = 0; // Track consecutive ad-like silences
    this.silenceHistory = []; // Store recent silence events
    this.currentSilenceStart = null;
    this.lastAudioLevel = 0;
    this.audioLevelHistory = [];
    this.isInSilence = false;

    // ✅ EXISTING: Ad pattern detection
    this.adSilencePattern = []; // Store silence intervals that match ad patterns
    this.musicContinuityScore = 0; // Higher = more likely continuous music
    this.adBreakConfidence = 0; // Confidence that we're in an ad break

    // ✅ NEW: Rhythm/Beat detection properties
    this.beatHistory = []; // Store detected beat intervals
    this.rhythmScore = 0; // Higher = more rhythmic = more likely music
    this.lastBeatTime = null;
    this.beatIntervals = []; // Store time between beats
    this.averageBPM = 0; // Detected beats per minute
    this.rhythmConsistency = 0; // How consistent the rhythm is
    this.bassEnergyHistory = []; // Low frequency energy (bass/drums)
    this.midEnergyHistory = []; // Mid frequency energy (melody)
    this.highEnergyHistory = []; // High frequency energy (vocals/cymbals)

    // ✅ NEW: Frequency band analysis for music detection
    this.frequencyBands = {
      bass: { start: 0, end: 8 },      // 20-250 Hz (bass, drums)
      midLow: { start: 8, end: 32 },   // 250-1000 Hz (low mids)
      mid: { start: 32, end: 128 },    // 1000-4000 Hz (vocals, melody)
      high: { start: 128, end: 256 }   // 4000-8000 Hz (cymbals, harmonics)
    };

    // ✅ NEW: Speech vs Music indicators
    this.speechIndicators = {
      spectralCentroid: [], // Higher = more speech-like
      spectralRolloff: [],  // Speech has different rolloff than music
      zeroCrossingRate: [], // Speech has higher zero crossings
      harmonicRatio: []     // Music has more harmonics
    };

    // ✅ NEW: Warm-up/initialization properties
    this.isWarmingUp = true;
    this.warmupStartTime = null;
    this.warmupDuration = 8000; // 8 seconds warm-up period
    this.warmupSamples = 0;
    this.minWarmupSamples = 4; // Minimum samples before considering ready
    this.warmupResults = []; // Store results during warm-up for analysis
  }

  // Initialize with focus on silence + rhythm detection
  async initialize() {
    try {
      this.status = 'processing';
      // console.log('🔧 Initializing enhanced silence + rhythm ad detector...');
      // console.log('🎯 Detection strategy: Silence patterns + Rhythm analysis + Frequency characteristics');
      // console.log('🥁 Beat detection: Looking for consistent rhythmic patterns in music');
      // console.log('🗣️ Speech detection: Analyzing spectral characteristics');
      this.status = 'idle';
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize detector:', error);
      this.status = 'error';
      return false;
    }
  }

  // ✅ CRITICAL FIX: Enhanced audio analysis setup with proper AudioContext management
  setupAudioAnalysis(audioElement) {
    try {
      // ✅ CRITICAL FIX: Use or create a shared AudioContext to prevent conflicts
      if (!window.sharedAudioContext || window.sharedAudioContext.state === 'closed') {
        console.log('🔧 Creating new shared AudioContext for music detection');
        window.sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      this.audioContext = window.sharedAudioContext;

      if (this.audioContext.state === 'suspended') {
        console.log('🔧 Resuming suspended AudioContext');
        this.audioContext.resume();
      }

      // ✅ FIX: Always create new analyser for fresh connection
      if (this.analyser) {
        try {
          this.analyser.disconnect();
        } catch (e) {
          console.log('🔧 Previous analyser already disconnected');
        }
      }
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // ✅ INCREASED for better frequency resolution
      this.analyser.smoothingTimeConstant = 0.2; // Less smoothing for rhythm detection

      // ✅ CRITICAL FIX: Better MediaElementSource management
      const sourceKey = 'musicDetectionSource';

      // Check if we already have a source for this audio element
      if (!audioElement[sourceKey] || audioElement[sourceKey].context !== this.audioContext) {
        console.log('🔧 Creating new MediaElementSource for music detection');

        // Disconnect any existing source if it exists
        if (audioElement[sourceKey]) {
          try {
            audioElement[sourceKey].disconnect();
          } catch (e) {
            console.log('🔧 Previous source already disconnected');
          }
        }

        // Create new source with our shared context
        audioElement[sourceKey] = this.audioContext.createMediaElementSource(audioElement);
      }

      this.source = audioElement[sourceKey];

      // ✅ FIX: Create gain node to preserve audio output
      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;
      }

      // ✅ CRITICAL FIX: Safe connection with error handling
      try {
        // Connect for analysis
        this.source.connect(this.analyser);

        // ✅ CRITICAL: Also connect to destination to maintain audio output
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        console.log('🔧 Enhanced audio analysis setup complete (FFT: 4096, Rhythm detection enabled)');
      } catch (connectionError) {
        if (connectionError.message.includes('already connected')) {
          console.log('🔄 Audio connections already established');
        } else {
          console.error('🔧 Connection error:', connectionError);
          throw connectionError;
        }
      }

      return true;
    } catch (error) {
      console.error('Audio analysis setup failed:', error);
      return false;
    }
  }

  // ✅ NEW: Analyze frequency bands for music characteristics
  analyzeFrequencyBands(frequencyData) {
    const bands = {};
    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / (frequencyData.length);

    // Calculate energy in each frequency band
    Object.keys(this.frequencyBands).forEach(bandName => {
      const band = this.frequencyBands[bandName];
      let energy = 0;
      let count = 0;

      for (let i = band.start; i < Math.min(band.end, frequencyData.length); i++) {
        energy += frequencyData[i];
        count++;
      }

      bands[bandName] = count > 0 ? energy / count : 0;
    });

    // Store in history (keep last 100 samples = ~10 seconds)
    this.bassEnergyHistory.push(bands.bass);
    this.midEnergyHistory.push(bands.mid);
    this.highEnergyHistory.push(bands.high);

    if (this.bassEnergyHistory.length > 100) {
      this.bassEnergyHistory.shift();
      this.midEnergyHistory.shift();
      this.highEnergyHistory.shift();
    }

    return bands;
  }

  // ✅ NEW: Beat/Rhythm detection
  detectBeatAndRhythm(frequencyBands, waveformData) {
    const now = Date.now();

    // Focus on bass frequencies for beat detection (drums, bass)
    const bassEnergy = frequencyBands.bass;
    const midEnergy = frequencyBands.mid;

    // Beat detection: Look for sudden increases in bass energy
    const recentBass = this.bassEnergyHistory.slice(-5); // Last 0.5 seconds
    if (recentBass.length >= 5) {
      const avgRecentBass = recentBass.reduce((sum, val) => sum + val, 0) / recentBass.length;
      const previousAvg = this.bassEnergyHistory.slice(-10, -5);
      const avgPreviousBass = previousAvg.length > 0 ?
        previousAvg.reduce((sum, val) => sum + val, 0) / previousAvg.length : 0;

      // Beat detected if current bass energy is significantly higher than recent average
      const beatThreshold = avgPreviousBass + (avgPreviousBass * 0.3); // 30% increase
      const isBeat = bassEnergy > beatThreshold && bassEnergy > 20; // Minimum energy threshold

      if (isBeat && (!this.lastBeatTime || now - this.lastBeatTime > 200)) { // Max 300 BPM
        const timeSinceLastBeat = this.lastBeatTime ? now - this.lastBeatTime : 0;

        if (timeSinceLastBeat > 0) {
          this.beatIntervals.push(timeSinceLastBeat);

          // Keep only recent beat intervals (last 20 beats)
          if (this.beatIntervals.length > 20) {
            this.beatIntervals.shift();
          }

          // Calculate BPM and rhythm consistency
          this.calculateRhythmMetrics();
        }

        this.lastBeatTime = now;
        this.beatHistory.push({ timestamp: now, energy: bassEnergy });

        // Keep only recent beats (last 30 seconds)
        this.beatHistory = this.beatHistory.filter(beat => now - beat.timestamp < 30000);
      }
    }
  }

  // ✅ NEW: Calculate rhythm metrics
  calculateRhythmMetrics() {
    if (this.beatIntervals.length < 3) {
      this.rhythmScore = 0;
      this.rhythmConsistency = 0;
      return;
    }

    // Calculate average BPM
    const avgInterval = this.beatIntervals.reduce((sum, interval) => sum + interval, 0) / this.beatIntervals.length;
    this.averageBPM = Math.round(60000 / avgInterval); // Convert ms to BPM

    // Calculate rhythm consistency (lower standard deviation = more consistent)
    const mean = avgInterval;
    const variance = this.beatIntervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / this.beatIntervals.length;
    const stdDev = Math.sqrt(variance);

    // Consistency score: higher = more consistent rhythm
    this.rhythmConsistency = Math.max(0, 100 - (stdDev / mean * 100));

    // Overall rhythm score combines consistency and reasonable BPM range
    const bpmScore = (this.averageBPM >= 60 && this.averageBPM <= 200) ? 100 : 0; // Typical music BPM range
    this.rhythmScore = (this.rhythmConsistency * 0.7) + (bpmScore * 0.3);

    // Recent beat activity bonus
    const recentBeats = this.beatHistory.filter(beat => Date.now() - beat.timestamp < 10000); // Last 10 seconds
    const beatActivityScore = Math.min(100, recentBeats.length * 10); // Up to 10 beats in 10 seconds

    this.rhythmScore = (this.rhythmScore * 0.8) + (beatActivityScore * 0.2);
  }

  // ✅ NEW: Analyze speech characteristics
  analyzeSpeechCharacteristics(frequencyData, waveformData) {
    // Spectral Centroid (center of mass of spectrum)
    let weightedSum = 0;
    let magnitudeSum = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i];
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }

    const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

    // Spectral Rolloff (frequency below which 85% of energy is contained)
    let energySum = 0;
    const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
    const rolloffThreshold = totalEnergy * 0.85;

    let spectralRolloff = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      energySum += frequencyData[i];
      if (energySum >= rolloffThreshold) {
        spectralRolloff = i;
        break;
      }
    }

    // Zero Crossing Rate (how often signal crosses zero)
    let zeroCrossings = 0;
    for (let i = 1; i < waveformData.length; i++) {
      const current = (waveformData[i] - 128) / 128;
      const previous = (waveformData[i - 1] - 128) / 128;
      if ((current >= 0) !== (previous >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / waveformData.length;

    // Harmonic ratio (ratio of harmonic to noise energy)
    const bassEnergy = this.bassEnergyHistory.slice(-1)[0] || 0;
    const midEnergy = this.midEnergyHistory.slice(-1)[0] || 0;
    const highEnergy = this.highEnergyHistory.slice(-1)[0] || 0;
    const harmonicRatio = (bassEnergy + midEnergy) / Math.max(1, highEnergy);

    // Store in history
    this.speechIndicators.spectralCentroid.push(spectralCentroid);
    this.speechIndicators.spectralRolloff.push(spectralRolloff);
    this.speechIndicators.zeroCrossingRate.push(zeroCrossingRate);
    this.speechIndicators.harmonicRatio.push(harmonicRatio);

    // Keep only recent history (last 50 samples = ~5 seconds)
    Object.keys(this.speechIndicators).forEach(key => {
      if (this.speechIndicators[key].length > 50) {
        this.speechIndicators[key].shift();
      }
    });

    return { spectralCentroid, spectralRolloff, zeroCrossingRate, harmonicRatio };
  }

  // ✅ NEW: Calculate music vs speech probability
  calculateMusicProbability() {
    if (this.speechIndicators.spectralCentroid.length < 10) return 0.5;

    const recent = 10; // Last 1 second
    let musicScore = 50; // Start neutral

    // Rhythm indicators (music has rhythm, speech doesn't)
    if (this.rhythmScore > 60) {
      musicScore += 25; // Strong rhythm = likely music
    } else if (this.rhythmScore > 30) {
      musicScore += 10; // Some rhythm = possibly music
    } else if (this.rhythmScore < 10) {
      musicScore -= 15; // No rhythm = likely speech/ads
    }

    // Spectral characteristics
    const avgCentroid = this.speechIndicators.spectralCentroid.slice(-recent).reduce((sum, val) => sum + val, 0) / recent;
    const avgZCR = this.speechIndicators.zeroCrossingRate.slice(-recent).reduce((sum, val) => sum + val, 0) / recent;
    const avgHarmonic = this.speechIndicators.harmonicRatio.slice(-recent).reduce((sum, val) => sum + val, 0) / recent;

    // Music typically has:
    // - More consistent spectral centroid
    // - Lower zero crossing rate
    // - Higher harmonic content

    if (avgZCR < 0.1) musicScore += 15; // Low ZCR = likely music
    else if (avgZCR > 0.2) musicScore -= 15; // High ZCR = likely speech

    if (avgHarmonic > 2) musicScore += 10; // Rich harmonics = likely music
    else if (avgHarmonic < 0.5) musicScore -= 10; // Poor harmonics = likely speech

    // Frequency band consistency (music has more consistent energy distribution)
    if (this.bassEnergyHistory.length >= 20) {
      const bassVariance = this.calculateVariance(this.bassEnergyHistory.slice(-20));
      const midVariance = this.calculateVariance(this.midEnergyHistory.slice(-20));

      const avgVariance = (bassVariance + midVariance) / 2;
      if (avgVariance < 100) musicScore += 10; // Consistent = music
      else if (avgVariance > 300) musicScore -= 10; // Inconsistent = speech/ads
    }

    return Math.max(0, Math.min(100, musicScore)) / 100;
  }

  // ✅ HELPER: Calculate variance
  calculateVariance(array) {
    if (array.length === 0) return 0;
    const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    return variance;
  }

  // ✅ MISSING METHOD: Calculate music continuity score
  calculateMusicContinuityScore() {
    if (this.audioLevelHistory.length < 10) return;

    // Calculate how consistent the audio levels are (music = more consistent)
    const recent = this.audioLevelHistory.slice(-20); // Last 2 seconds
    const levels = recent.map(h => h.level);

    // Standard deviation of audio levels (lower = more consistent = more likely music)
    const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const variance = levels.reduce((sum, level) => sum + Math.pow(level - mean, 2), 0) / levels.length;
    const stdDev = Math.sqrt(variance);

    // Continuity score: higher = more consistent = more likely music
    this.musicContinuityScore = Math.max(0, 100 - stdDev * 2);

    // Factor in recent silences
    const recentSilences = this.silenceHistory.filter(s => Date.now() - s.timestamp < 60000); // Last minute
    if (recentSilences.length > 0) {
      this.musicContinuityScore *= Math.max(0.1, 1 - (recentSilences.length * 0.2));
    }
  }

  // ✅ ENHANCED: Multi-modal audio analysis
  detectSilencePatterns() {
    if (!this.analyser) return null;

    const waveformData = new Uint8Array(this.analyser.fftSize);
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.getByteTimeDomainData(waveformData);
    this.analyser.getByteFrequencyData(frequencyData);

    // ✅ EXISTING: Calculate RMS for audio level
    let sum = 0;
    for (let i = 0; i < waveformData.length; i++) {
      const sample = (waveformData[i] - 128) / 128; // Normalize to -1 to 1
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / waveformData.length) * 100; // Scale to 0-100

    // ✅ EXISTING: Calculate frequency energy
    const totalFrequencyEnergy = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
    const audioLevel = (rms + totalFrequencyEnergy) / 2;
    this.lastAudioLevel = audioLevel;

    // ✅ NEW: Enhanced analysis with frequency bands and rhythm
    const frequencyBands = this.analyzeFrequencyBands(frequencyData);
    this.detectBeatAndRhythm(frequencyBands, waveformData);
    const speechAnalysis = this.analyzeSpeechCharacteristics(frequencyData, waveformData);
    const musicProbability = this.calculateMusicProbability();

    // ✅ EXISTING: Audio level history
    this.audioLevelHistory.push({
      level: audioLevel,
      timestamp: Date.now(),
      rms: rms,
      frequencyEnergy: totalFrequencyEnergy,
      // ✅ NEW: Enhanced data
      frequencyBands: frequencyBands,
      rhythmScore: this.rhythmScore,
      musicProbability: musicProbability,
      bpm: this.averageBPM
    });

    if (this.audioLevelHistory.length > 50) {
      this.audioLevelHistory.shift();
    }

    return this.analyzeSilencePatterns(audioLevel, musicProbability);
  }

  // ✅ ENHANCED: Silence pattern analysis with rhythm context
  analyzeSilencePatterns(currentAudioLevel, musicProbability) {
    const now = Date.now();
    const silenceThreshold = this.silenceThreshold;

    // ✅ EXISTING: Silence detection logic (keeping the 3-silence rule)
    if (currentAudioLevel < silenceThreshold && !this.isInSilence) {
      this.isInSilence = true;
      this.currentSilenceStart = now;
      console.log(`🔇 Silence started at ${new Date(now).toLocaleTimeString()}, level: ${currentAudioLevel.toFixed(2)}`);
    }

    else if (currentAudioLevel >= silenceThreshold && this.isInSilence) {
      const silenceDuration = (now - this.currentSilenceStart) / 1000; // seconds
      this.isInSilence = false;

      console.log(`🔊 Silence ended, duration: ${silenceDuration.toFixed(2)}s, level: ${currentAudioLevel.toFixed(2)}`);

      // ✅ ENHANCED: Consider rhythm context for silence evaluation
      const hasRhythm = this.rhythmScore > 30;
      const isMusicLikely = musicProbability > 0.6;

      // Check if this silence matches ad pattern
      if (silenceDuration >= this.silenceMinDuration && silenceDuration <= this.silenceMaxDuration) {
        // ✅ NEW: Be more conservative about counting silences if we detect music characteristics
        const shouldCountSilence = !hasRhythm || !isMusicLikely || silenceDuration > 1.0;

        if (shouldCountSilence) {
          this.consecutiveSilences++;

          this.silenceHistory.push({
            duration: silenceDuration,
            timestamp: now,
            isAdLike: true,
            rhythmScore: this.rhythmScore,
            musicProbability: musicProbability
          });

          console.log(`📢 Ad-like silence detected (#${this.consecutiveSilences}): ${silenceDuration.toFixed(2)}s (Rhythm: ${this.rhythmScore.toFixed(1)}, Music: ${(musicProbability * 100).toFixed(1)}%)`);

          // ✅ YOUR IDEA: Trigger ad break after 3 consecutive ad-like silences
          if (this.consecutiveSilences >= 3) {
            console.log('🚨 AD BREAK DETECTED! 3 consecutive silences found');
            this.adBreakConfidence = 0.95;
            this.consecutiveNoMusicCount = 3;
            return this.createDetectionResult(false, this.adBreakConfidence, 'ad_silences_detected', musicProbability);
          }
        } else {
          console.log(`🎵 Silence ignored due to music characteristics (Rhythm: ${this.rhythmScore.toFixed(1)}, Music: ${(musicProbability * 100).toFixed(1)}%)`);
        }
      } else {
        if (silenceDuration > this.silenceMaxDuration) {
          console.log(`🎵 Long pause detected (${silenceDuration.toFixed(2)}s) - likely music break, resetting ad counter`);
        }
        this.consecutiveSilences = 0;
      }

      this.silenceHistory = this.silenceHistory.filter(s => now - s.timestamp < 600000);
      this.currentSilenceStart = null;
    }

    // ✅ EXISTING: Calculate music continuity score
    this.calculateMusicContinuityScore();

    // ✅ ENHANCED: Determine if we're likely in music or ads with rhythm context
    const isMusic = this.determineMusicVsAds(currentAudioLevel, musicProbability);
    const confidence = this.calculateConfidence(currentAudioLevel, isMusic, musicProbability);

    return this.createDetectionResult(isMusic, confidence, 'enhanced_multimodal_analysis', musicProbability);
  }

  // ✅ ENHANCED: Music vs ads determination with rhythm
  determineMusicVsAds(currentAudioLevel, musicProbability) {
    // Strong ad indicators
    if (this.consecutiveSilences >= 2) {
      return false; // Likely ads
    }

    // ✅ NEW: Strong music indicators from rhythm analysis
    if (this.rhythmScore > 70 && musicProbability > 0.7) {
      return true; // Strong rhythmic music
    }

    if (this.rhythmScore > 50 && this.consecutiveSilences === 0 && musicProbability > 0.6) {
      return true; // Likely rhythmic music
    }

    // ✅ EXISTING: Strong music indicators from continuity
    if (this.musicContinuityScore > 70 && this.consecutiveSilences === 0) {
      return true; // Likely music
    }

    // ✅ NEW: Speech/ad indicators
    if (musicProbability < 0.3 && this.rhythmScore < 20) {
      return false; // Likely speech/ads
    }

    // Medium confidence decisions
    if (this.consecutiveSilences === 1 && (this.musicContinuityScore < 40 || musicProbability < 0.4)) {
      return false; // Leaning towards ads
    }

    if (this.consecutiveSilences === 0 && (this.musicContinuityScore > 50 || musicProbability > 0.6)) {
      return true; // Leaning towards music
    }

    // Default to music if unclear (safer than false positives)
    return currentAudioLevel >= this.silenceThreshold;
  }

  // ✅ ENHANCED: Confidence calculation with rhythm factors
  calculateConfidence(currentAudioLevel, isMusic, musicProbability) {
    let confidence = 0.5; // Base confidence

    // High confidence for clear ad patterns
    if (this.consecutiveSilences >= 3) {
      confidence = 0.95;
    } else if (this.consecutiveSilences === 2) {
      confidence = 0.80;
    } else if (this.consecutiveSilences === 1) {
      confidence = 0.65;
    }

    // ✅ NEW: High confidence for rhythmic music
    else if (this.rhythmScore > 70 && musicProbability > 0.7) {
      confidence = 0.90;
    } else if (this.rhythmScore > 50 && musicProbability > 0.6) {
      confidence = 0.80;
    }

    // ✅ EXISTING: High confidence for continuous music
    else if (this.musicContinuityScore > 80 && this.consecutiveSilences === 0) {
      confidence = 0.90;
    } else if (this.musicContinuityScore > 60 && this.consecutiveSilences === 0) {
      confidence = 0.75;
    }

    // ✅ NEW: Factor in music probability from spectral analysis
    const musicFactor = isMusic ? musicProbability : (1 - musicProbability);
    confidence = (confidence * 0.7) + (musicFactor * 0.3);

    // ✅ EXISTING: Factor in audio level consistency
    if (this.audioLevelHistory.length >= 10) {
      const recent = this.audioLevelHistory.slice(-10);
      const levels = recent.map(h => h.level);
      const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;

      const levelFactor = Math.min(1, avgLevel / 20);
      confidence = Math.min(0.95, confidence + (levelFactor * 0.1));
    }

    return Math.max(0.1, confidence);
  }

  // ✅ ENHANCED: Detection result with proper warm-up completion handling
  createDetectionResult(isMusic, confidence, detectionMethod, musicProbability) {
    const result = {
      isMusic,
      confidence,
      consecutiveNoMusic: isMusic ? 0 : this.consecutiveNoMusicCount,
      timestamp: new Date().toISOString(),
      status: isMusic ? 'music' : 'no-music',

      // ✅ NEW: Warm-up information
      isWarmingUp: this.isWarmingUp,
      warmupProgress: this.isWarmingUp ?
        Math.min(100, (this.warmupSamples / this.minWarmupSamples) * 50 +
          ((Date.now() - this.warmupStartTime) / this.warmupDuration) * 50) : 100,

      silenceInfo: {
        consecutiveSilences: this.consecutiveSilences,
        isInSilence: this.isInSilence,
        lastAudioLevel: this.lastAudioLevel,
        musicContinuityScore: this.musicContinuityScore,
        recentSilences: this.silenceHistory.slice(-5),
        detectionMethod,
        rhythmScore: this.rhythmScore,
        averageBPM: this.averageBPM,
        rhythmConsistency: this.rhythmConsistency,
        musicProbability: musicProbability,
        recentBeats: this.beatHistory.slice(-5).length
      },

      // ✅ CRITICAL: Only trigger ad break if NOT warming up
      triggerAdBreak: !this.isWarmingUp && this.consecutiveSilences >= 3
    };

    return result;
  }

  // ✅ ENHANCED: Complete warm-up process with better state management
  completeWarmup() {
    if (!this.isWarmingUp) return;

    console.log('🔥 Detector warm-up completed!');
    console.log(`📊 Warm-up stats: ${this.warmupSamples} samples over ${(Date.now() - this.warmupStartTime) / 1000}s`);

    // Analyze warm-up results to set better initial state
    if (this.warmupResults.length > 0) {
      const avgMusicProb = this.warmupResults.reduce((sum, r) => sum + (r.silenceInfo?.musicProbability || 0.5), 0) / this.warmupResults.length;
      const avgRhythm = this.warmupResults.reduce((sum, r) => sum + (r.silenceInfo?.rhythmScore || 0), 0) / this.warmupResults.length;

      console.log(`🎵 Warm-up analysis: Music probability: ${(avgMusicProb * 100).toFixed(1)}%, Rhythm score: ${avgRhythm.toFixed(1)}`);

      // If warm-up shows strong music characteristics, bias initial state
      if (avgMusicProb > 0.7 && avgRhythm > 50) {
        console.log('🎵 Strong music detected during warm-up - optimizing detection');
        this.musicContinuityScore = 75; // Start with higher music score
        this.consecutiveSilences = 0; // Reset any false silence counts
      }
    }

    this.isWarmingUp = false;
    this.warmupResults = []; // Clear to save memory

    // ✅ NEW: Add a brief stabilization period after warm-up
    this.isStabilizing = true;
    this.stabilizationStartTime = Date.now();
    this.stabilizationDuration = 2000; // 2 second stabilization period

    console.log('🎯 Entering 2-second stabilization period for reliable detection...');
  }

  // ✅ NEW: Check if we're in stabilization period
  isInStabilization() {
    if (!this.isStabilizing) return false;

    const elapsed = Date.now() - this.stabilizationStartTime;
    if (elapsed >= this.stabilizationDuration) {
      this.isStabilizing = false;
      console.log('🎯 Stabilization complete - detection now fully active');
      return false;
    }

    return true;
  }

  // ✅ ENHANCED: Main classification method with stabilization handling
  async classifyAudio() {
    if (!this.analyser) {
      this.status = 'error';
      return null;
    }

    try {
      // ✅ Check if we're still warming up
      if (this.isWarmingUp) {
        this.status = 'warming_up';
        this.warmupSamples++;

        // Check if warm-up should complete
        if (this.isDetectorReady()) {
          this.completeWarmup();
          this.status = 'stabilizing';
        }
      }
      // ✅ NEW: Check if we're in stabilization period
      else if (this.isInStabilization()) {
        this.status = 'stabilizing';
      }
      else {
        this.status = 'processing';
      }

      // Use enhanced multi-modal analysis
      const result = this.detectSilencePatterns();

      if (!result) {
        this.status = 'error';
        return null;
      }

      // ✅ CRITICAL: Mark result as warm-up OR stabilizing if still in those phases
      result.isWarmingUp = this.isWarmingUp;
      result.isStabilizing = this.isStabilizing;

      // ✅ NEW: Show stabilization progress
      if (this.isStabilizing) {
        const elapsed = Date.now() - this.stabilizationStartTime;
        result.stabilizationProgress = Math.min(100, (elapsed / this.stabilizationDuration) * 100);
        result.displayStatus = `Opstarten...`;
        result.showAsListening = true;
      } else if (this.isWarmingUp) {
        result.warmupProgress = this.isWarmingUp ?
          Math.min(100, (this.warmupSamples / this.minWarmupSamples) * 50 +
            ((Date.now() - this.warmupStartTime) / this.warmupDuration) * 50) : 100;
        result.displayStatus = `Opstarten...`;
        result.showAsListening = true;
      }

      // Store results during warm-up OR stabilization
      if (this.isWarmingUp) {
        this.warmupResults.push(result);
        this.status = 'warming_up';
        return result;
      } else if (this.isStabilizing) {
        // Don't update counters during stabilization either
        this.status = 'stabilizing';
        return result;
      }

      // ✅ Only update counters and status AFTER both warm-up AND stabilization
      this.status = result.isMusic ? 'music' : 'no-music';

      if (!result.isMusic) {
        this.consecutiveNoMusicCount++;
      } else {
        this.consecutiveNoMusicCount = 0;
        // Reset consecutive silences if we detect clear music with rhythm
        if (result.confidence > 0.8 && result.silenceInfo.rhythmScore > 50) {
          this.consecutiveSilences = 0;
        }
      }

      // Add to detection history (only after both warm-up and stabilization)
      this.detectionHistory.push({
        timestamp: Date.now(),
        isMusic: result.isMusic,
        confidence: result.confidence,
        silenceInfo: result.silenceInfo
      });

      if (this.detectionHistory.length > 20) {
        this.detectionHistory.shift();
      }

      this.lastDetectionTime = Date.now();
      return result;

    } catch (error) {
      console.error('❌ Classification error:', error);
      this.status = 'error';
      return null;
    }
  }

  // ✅ ENHANCED: Start detection with both warm-up and stabilization
  startDetection(audioElement, callback, isTestMode = false) {
    this.detectionCallback = callback;
    this.audioElement = audioElement;
    this.consecutiveNoMusicCount = 0;
    this.consecutiveSilences = 0;
    this.detectionHistory = [];
    this.silenceHistory = [];
    this.audioLevelHistory = [];

    // ✅ Initialize warm-up
    this.isWarmingUp = true;
    this.warmupStartTime = Date.now();
    this.warmupSamples = 0;
    this.warmupResults = [];

    // ✅ Initialize stabilization (will start after warm-up)
    this.isStabilizing = false;
    this.stabilizationStartTime = null;
    this.stabilizationDuration = 2000;

    // Reset rhythm detection
    this.beatHistory = [];
    this.beatIntervals = [];
    this.rhythmScore = 0;
    this.lastBeatTime = null;
    this.bassEnergyHistory = [];
    this.midEnergyHistory = [];
    this.highEnergyHistory = [];
    this.speechIndicators = {
      spectralCentroid: [],
      spectralRolloff: [],
      zeroCrossingRate: [],
      harmonicRatio: []
    };

    if (!this.setupAudioAnalysis(audioElement)) {
      throw new Error('Failed to setup audio analysis');
    }

    this.isAnalyzing = true;
    this.status = 'warming_up';

    console.log('🔥 Starting detector warm-up phase...');
    console.log(`⏱️ Warm-up duration: ${this.warmupDuration / 1000}s (minimum ${this.minWarmupSamples} samples)`);
    console.log('🎯 Detection results during warm-up AND stabilization will NOT trigger ad breaks');

    if (isTestMode) {
      this.runTestDetectionLoop();
    } else {
      this.runDetectionLoop();
    }

    return true;
  }



  // ✅ ENHANCED: Test detection loop with rhythm info
  async runTestDetectionLoop() {
    if (!this.isAnalyzing) return;

    console.log('🧪 Running enhanced silence + rhythm detection...');
    this.status = 'listening';

    const result = await this.classifyAudio();

    if (result && this.detectionCallback) {
      this.detectionCallback(result);
    }

    // Continue testing every 1-2 seconds for better analysis
    if (this.isAnalyzing) {
      setTimeout(() => this.runTestDetectionLoop(), 1500);
    }
  }

  // ✅ MISSING: Regular detection loop for production use
  async runDetectionLoop() {
    if (!this.isAnalyzing) return;

    const result = await this.classifyAudio();

    if (result && this.detectionCallback) {
      this.detectionCallback(result);
    }

    // Continue detection every 2 seconds
    if (this.isAnalyzing) {
      setTimeout(() => this.runDetectionLoop(), 2000);
    }
  }

  // ✅ CRITICAL FIX: Enhanced stop detection with bulletproof volume preservation
  stopDetection() {
    console.log('🔧 Stopping enhanced detection...');
    this.isAnalyzing = false;
    this.status = 'idle';
    this.consecutiveNoMusicCount = 0;
    this.consecutiveSilences = 0;

    // ✅ CRITICAL FIX: ONLY restore volume if it was changed during detection
    // Don't apply "safety nets" that might gradually increase volume

    // Clean up audio analysis connections but DON'T touch volume
    if (this.analyser) {
      try {
        this.analyser.disconnect();
        console.log('🔧 Analyser disconnected');
      } catch (error) {
        console.warn('Failed to disconnect analyser:', error);
      }
      this.analyser = null;
    }

    // ✅ CRITICAL FIX: REMOVE all volume manipulation from cleanup
    // The volume should be handled by the main audio player only

    this.source = null;

    console.log('🔧 Enhanced detection stopped - NO volume changes applied');
  }


  // ✅ NEW: Check if detector is ready for reliable detection
  isDetectorReady() {
    if (!this.isWarmingUp) return true;

    const now = Date.now();
    const warmupTimeElapsed = now - this.warmupStartTime;
    const hasEnoughSamples = this.warmupSamples >= this.minWarmupSamples;
    const hasEnoughTime = warmupTimeElapsed >= this.warmupDuration;

    // ✅ Require BOTH time AND samples for reliability
    return hasEnoughSamples && hasEnoughTime;
  }

} // End of MusicDetector class

export const setupAdDetection = async (audioElement, adBreakCallback) => {
  const detector = new MusicDetector();

  console.log('🔧 Initializing detection with warm-up + stabilization phase...');
  await detector.initialize();

  detector.startDetection(audioElement, (result) => {
    // ✅ ENHANCED: Handle both warm-up AND stabilization phases
    if (result.isWarmingUp || result.isStabilizing) {
      const phase = result.isWarmingUp ? 'warm-up' : 'stabilization';
      const progress = result.isWarmingUp ? result.warmupProgress : result.stabilizationProgress;
      
      console.log(`🔥 ${phase}...`, {
        progress: `${Math.round(progress)}%`,
        samples: detector.warmupSamples,
        timeElapsed: `${((Date.now() - (detector.warmupStartTime || detector.stabilizationStartTime)) / 1000).toFixed(1)}s`
      });

      // Don't trigger any ad breaks during warm-up OR stabilization
      return;
    }

    // ✅ Only log significant events after FULL initialization
    const shouldLog = !result.isMusic ||
      result.confidence > 0.8 ||
      Math.random() < 0.1;

    if (shouldLog) {
      console.log('🎯 Detection sample:', {
        type: result.isMusic ? '🎵 Muziek' : '📢 Geen Muziek',
        confidence: `${Math.round(result.confidence * 100)}%`,
        silences: `${result.silenceInfo.consecutiveSilences}/3`,
        mode: 'READY'
      });
    }

    // Always pass to callback for decision making (but only after full initialization)
    adBreakCallback(result);
  });

  return detector;
};

export const setupTestDetection = async (audioElement, statusCallback) => {
  if (globalDetector) {
    console.log('🔄 Stopping existing global detector...');
    globalDetector.stopDetection();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  globalDetector = new MusicDetector();

  console.log('🧪 Initializing test detector with warm-up + stabilization phase...');
  await globalDetector.initialize();

  const enhancedCallback = (result) => {
    // ✅ ENHANCED: Show warm-up AND stabilization status in test mode
    if (result.isWarmingUp || result.isStabilizing) {
      const testResult = {
        ...result,
        displayStatus: result.displayStatus || `Opstarten...`,
        showAsListening: true
      };

      const phase = result.isWarmingUp ? 'warm-up' : 'stabilization';
      const progress = result.isWarmingUp ? result.warmupProgress : result.stabilizationProgress;
      
      console.log(`🔥 Test ${phase}:`, {
        progress: `${Math.round(progress)}%`,
        samples: globalDetector.warmupSamples,
        time: `${((Date.now() - (globalDetector.warmupStartTime || globalDetector.stabilizationStartTime)) / 1000).toFixed(1)}s`
      });

      if (statusCallback) {
        statusCallback(testResult);
      }
      return;
    }

    // ✅ Regular test results after full initialization
    console.log('🧪 Test result (ready):', result);
    try {
      if (statusCallback) {
        statusCallback(result);
      }
    } catch (callbackError) {
      console.error('Status callback failed:', callbackError);
    }
  };

  const success = globalDetector.startDetection(audioElement, enhancedCallback, true);

  if (!success) {
    throw new Error('Failed to start enhanced test detection');
  }

  return globalDetector;
};

export const cleanupTestDetection = () => {
  if (globalDetector) {
    console.log('🧹 Cleaning up enhanced global detector...');
    globalDetector.stopDetection();

    // ✅ CRITICAL FIX: Give time for proper cleanup before nullifying
    setTimeout(() => {
      globalDetector = null;
      console.log('🧹 Global detector nullified');
    }, 500);
  }

  console.log('🧹 Enhanced detection resources cleaned up');
};

export default MusicDetector;