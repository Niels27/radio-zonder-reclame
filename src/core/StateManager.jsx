// core/StateManager.jsx - Centralized state management with React Context
// Single source of truth for the entire application

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Safe localStorage write - handles QuotaExceededError gracefully
const safePersist = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage write failed for "${key}":`, e.name);
  }
};

// Initial state shape
const initialState = {
  // Audio state
  currentStation: null,
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  isTransitioning: false,
  volume: 0.5,
  audioSource: null,        // 'radio' | 'spotify' | 'youtube' | null
  error: null,
  connectionStatus: null,   // Brief description of what's being tried
  isBuffering: false,        // Whether the stream is currently buffering

  // Ad break state
  isAdBreakActive: false,
  adBreakMode: 'playlist',  // 'playlist' | 'nonstop' | 'youtube'
  adBreakTimeLeft: null,
  nextAdBreakIn: null,
  isTimerRunning: false,
  savedStation: null,       // Station to restore after ad break

  // Playlist state (Spotify)
  playlistUrl: '',
  playlistId: null,
  playlistProvider: 'spotify',
  playlistShuffle: false,
  playlistInfo: null,

  // YouTube mode state
  youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Default: Lofi Girl

  // UI state
  showVisualizer: true,
  visualizerType: 'bars',
  visualizerBlur: 2,
  showFloatingPlayer: false,
  showDeveloperDashboard: false,

  // Settings
  fadeAudioStreams: false,
  useCommunityTimings: true,
  adBreakMinute: 29,
  adBreakMinute2: 59,
  adBreakDuration: 6,
  adBreakDuration2: 10,

  // Community timing
  currentAdBreakUsedCommunityTiming: false,
  nextCommunityTiming: null,
  showFeedbackPopup: false,
  feedbackStationName: ''
};

// Action types
const ActionTypes = {
  // Audio actions
  SET_STATION: 'SET_STATION',
  SET_PLAYING: 'SET_PLAYING',
  SET_PAUSED: 'SET_PAUSED',
  SET_LOADING: 'SET_LOADING',
  SET_TRANSITIONING: 'SET_TRANSITIONING',
  SET_VOLUME: 'SET_VOLUME',
  SET_AUDIO_SOURCE: 'SET_AUDIO_SOURCE',
  SET_ERROR: 'SET_ERROR',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_BUFFERING: 'SET_BUFFERING',

  // Ad break actions
  START_AD_BREAK: 'START_AD_BREAK',
  END_AD_BREAK: 'END_AD_BREAK',
  SET_AD_BREAK_MODE: 'SET_AD_BREAK_MODE',
  SET_AD_BREAK_TIME_LEFT: 'SET_AD_BREAK_TIME_LEFT',
  SET_NEXT_AD_BREAK_IN: 'SET_NEXT_AD_BREAK_IN',
  START_TIMER: 'START_TIMER',
  STOP_TIMER: 'STOP_TIMER',

  // Playlist actions
  SET_PLAYLIST_URL: 'SET_PLAYLIST_URL',
  SET_PLAYLIST_INFO: 'SET_PLAYLIST_INFO',
  SET_PLAYLIST_PROVIDER: 'SET_PLAYLIST_PROVIDER',
  SET_PLAYLIST_SHUFFLE: 'SET_PLAYLIST_SHUFFLE',
  SET_YOUTUBE_URL: 'SET_YOUTUBE_URL',

  // UI actions
  TOGGLE_VISUALIZER: 'TOGGLE_VISUALIZER',
  SET_VISUALIZER_TYPE: 'SET_VISUALIZER_TYPE',
  SET_VISUALIZER_BLUR: 'SET_VISUALIZER_BLUR',
  TOGGLE_FLOATING_PLAYER: 'TOGGLE_FLOATING_PLAYER',
  TOGGLE_DEVELOPER_DASHBOARD: 'TOGGLE_DEVELOPER_DASHBOARD',

  // Settings actions
  SET_FADE_AUDIO_STREAMS: 'SET_FADE_AUDIO_STREAMS',
  SET_USE_COMMUNITY_TIMINGS: 'SET_USE_COMMUNITY_TIMINGS',
  SET_AD_BREAK_SETTINGS: 'SET_AD_BREAK_SETTINGS',

  // Community timing actions
  SET_COMMUNITY_TIMING_STATE: 'SET_COMMUNITY_TIMING_STATE',
  SHOW_FEEDBACK_POPUP: 'SHOW_FEEDBACK_POPUP',
  HIDE_FEEDBACK_POPUP: 'HIDE_FEEDBACK_POPUP'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    // Audio actions
    case ActionTypes.SET_STATION:
      return { ...state, currentStation: action.payload };

    case ActionTypes.SET_PLAYING:
      return { ...state, isPlaying: action.payload, isPaused: !action.payload };

    case ActionTypes.SET_PAUSED:
      return { ...state, isPaused: action.payload };

    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ActionTypes.SET_TRANSITIONING:
      return { ...state, isTransitioning: action.payload };

    case ActionTypes.SET_VOLUME:
      return { ...state, volume: action.payload };

    case ActionTypes.SET_AUDIO_SOURCE:
      return { ...state, audioSource: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.SET_CONNECTION_STATUS:
      return { ...state, connectionStatus: action.payload };

    case ActionTypes.SET_BUFFERING:
      return { ...state, isBuffering: action.payload };

    // Ad break actions
    case ActionTypes.START_AD_BREAK:
      return {
        ...state,
        isAdBreakActive: true,
        savedStation: state.currentStation,
        adBreakMode: action.payload?.mode || state.adBreakMode
      };

    case ActionTypes.END_AD_BREAK:
      return {
        ...state,
        isAdBreakActive: false,
        adBreakTimeLeft: null,
        savedStation: null,
        currentAdBreakUsedCommunityTiming: false,
        nextCommunityTiming: null
      };

    case ActionTypes.SET_AD_BREAK_MODE:
      return { ...state, adBreakMode: action.payload };

    case ActionTypes.SET_AD_BREAK_TIME_LEFT:
      return { ...state, adBreakTimeLeft: action.payload };

    case ActionTypes.SET_NEXT_AD_BREAK_IN:
      return { ...state, nextAdBreakIn: action.payload };

    case ActionTypes.START_TIMER:
      return { ...state, isTimerRunning: true };

    case ActionTypes.STOP_TIMER:
      return { ...state, isTimerRunning: false, nextAdBreakIn: null };

    // Playlist actions
    case ActionTypes.SET_PLAYLIST_URL:
      return { ...state, playlistUrl: action.payload };

    case ActionTypes.SET_PLAYLIST_INFO:
      return { ...state, playlistInfo: action.payload };

    case ActionTypes.SET_PLAYLIST_PROVIDER:
      return { ...state, playlistProvider: action.payload };

    case ActionTypes.SET_PLAYLIST_SHUFFLE:
      return { ...state, playlistShuffle: action.payload };

    case ActionTypes.SET_YOUTUBE_URL:
      return { ...state, youtubeUrl: action.payload };

    // UI actions
    case ActionTypes.TOGGLE_VISUALIZER:
      return { ...state, showVisualizer: action.payload };

    case ActionTypes.SET_VISUALIZER_TYPE:
      return { ...state, visualizerType: action.payload };

    case ActionTypes.SET_VISUALIZER_BLUR:
      return { ...state, visualizerBlur: action.payload };

    case ActionTypes.TOGGLE_FLOATING_PLAYER:
      return { ...state, showFloatingPlayer: action.payload };

    case ActionTypes.TOGGLE_DEVELOPER_DASHBOARD:
      return { ...state, showDeveloperDashboard: action.payload };

    // Settings actions
    case ActionTypes.SET_FADE_AUDIO_STREAMS:
      return { ...state, fadeAudioStreams: action.payload };

    case ActionTypes.SET_USE_COMMUNITY_TIMINGS:
      return { ...state, useCommunityTimings: action.payload };

    case ActionTypes.SET_AD_BREAK_SETTINGS:
      return { ...state, ...action.payload };

    // Community timing actions
    case ActionTypes.SET_COMMUNITY_TIMING_STATE:
      return {
        ...state,
        currentAdBreakUsedCommunityTiming: action.payload.used,
        nextCommunityTiming: action.payload.timing
      };

    case ActionTypes.SHOW_FEEDBACK_POPUP:
      return {
        ...state,
        showFeedbackPopup: true,
        feedbackStationName: action.payload
      };

    case ActionTypes.HIDE_FEEDBACK_POPUP:
      return {
        ...state,
        showFeedbackPopup: false
      };

    default:
      return state;
  }
}

// Create context
const StateContext = createContext(null);
const DispatchContext = createContext(null);

// Provider component
export function StateProvider({ children }) {
  // Load initial state from localStorage
  const loadedState = {
    ...initialState,
    volume: parseFloat(localStorage.getItem('volume') || '0.5'),
    showVisualizer: JSON.parse(localStorage.getItem('visualizer_enabled') || 'true'),
    visualizerType: localStorage.getItem('visualizer_type') || 'bars',
    visualizerBlur: parseFloat(localStorage.getItem('visualizer_blur') || '2'),
    fadeAudioStreams: JSON.parse(localStorage.getItem('fade_audio_streams') || 'false'),
    useCommunityTimings: JSON.parse(localStorage.getItem('use_community_timings') || 'true'),
    playlistProvider: localStorage.getItem('playlist_provider') || 'spotify',
    youtubeUrl: localStorage.getItem('youtube_url') || localStorage.getItem('custom_lofi_url') || 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    adBreakMode: (() => {
      const saved = localStorage.getItem('adbreak_mode');
      // Migrate old 'lofi' mode to 'youtube'
      if (saved === 'lofi') return 'youtube';
      return saved || 'playlist';
    })(),
    adBreakMinute: parseInt(localStorage.getItem('adbreak_minute') || '29'),
    adBreakMinute2: parseInt(localStorage.getItem('adbreak_minute2') || '59'),
    adBreakDuration: parseInt(localStorage.getItem('adbreak_duration') || '6'),
    adBreakDuration2: parseInt(localStorage.getItem('adbreak_duration2') || '9')
  };

  const [state, dispatch] = useReducer(appReducer, loadedState);

  // Persist important state to localStorage
  useEffect(() => { safePersist('volume', state.volume.toString()); }, [state.volume]);
  useEffect(() => { safePersist('visualizer_enabled', JSON.stringify(state.showVisualizer)); }, [state.showVisualizer]);
  useEffect(() => { safePersist('visualizer_type', state.visualizerType); }, [state.visualizerType]);
  useEffect(() => { safePersist('visualizer_blur', state.visualizerBlur.toString()); }, [state.visualizerBlur]);
  useEffect(() => { safePersist('fade_audio_streams', JSON.stringify(state.fadeAudioStreams)); }, [state.fadeAudioStreams]);
  useEffect(() => { safePersist('use_community_timings', JSON.stringify(state.useCommunityTimings)); }, [state.useCommunityTimings]);
  useEffect(() => { safePersist('playlist_provider', state.playlistProvider); }, [state.playlistProvider]);
  useEffect(() => { safePersist('adbreak_mode', state.adBreakMode); }, [state.adBreakMode]);
  useEffect(() => { safePersist('youtube_url', state.youtubeUrl); }, [state.youtubeUrl]);
  useEffect(() => { safePersist('adbreak_minute', state.adBreakMinute.toString()); }, [state.adBreakMinute]);
  useEffect(() => { safePersist('adbreak_minute2', state.adBreakMinute2.toString()); }, [state.adBreakMinute2]);
  useEffect(() => { safePersist('adbreak_duration', state.adBreakDuration.toString()); }, [state.adBreakDuration]);
  useEffect(() => { safePersist('adbreak_duration2', state.adBreakDuration2.toString()); }, [state.adBreakDuration2]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Custom hooks for using state and dispatch
export function useAppState() {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error('useAppState must be used within StateProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (context === null) {
    throw new Error('useAppDispatch must be used within StateProvider');
  }
  return context;
}

// Action creators (convenience functions)
export function useActions() {
  const dispatch = useAppDispatch();

  return {
    // Audio actions
    setStation: useCallback((station) => {
      dispatch({ type: ActionTypes.SET_STATION, payload: station });
    }, [dispatch]),

    setPlaying: useCallback((isPlaying) => {
      dispatch({ type: ActionTypes.SET_PLAYING, payload: isPlaying });
    }, [dispatch]),

    setPaused: useCallback((isPaused) => {
      dispatch({ type: ActionTypes.SET_PAUSED, payload: isPaused });
    }, [dispatch]),

    setLoading: useCallback((isLoading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
    }, [dispatch]),

    setTransitioning: useCallback((isTransitioning) => {
      dispatch({ type: ActionTypes.SET_TRANSITIONING, payload: isTransitioning });
    }, [dispatch]),

    setVolume: useCallback((volume) => {
      dispatch({ type: ActionTypes.SET_VOLUME, payload: volume });
    }, [dispatch]),

    setAudioSource: useCallback((source) => {
      dispatch({ type: ActionTypes.SET_AUDIO_SOURCE, payload: source });
    }, [dispatch]),

    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, [dispatch]),

    setConnectionStatus: useCallback((status) => {
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: status });
    }, [dispatch]),

    setBuffering: useCallback((isBuffering) => {
      dispatch({ type: ActionTypes.SET_BUFFERING, payload: isBuffering });
    }, [dispatch]),

    // Ad break actions
    startAdBreak: useCallback((mode) => {
      dispatch({ type: ActionTypes.START_AD_BREAK, payload: { mode } });
    }, [dispatch]),

    endAdBreak: useCallback(() => {
      dispatch({ type: ActionTypes.END_AD_BREAK });
    }, [dispatch]),

    setAdBreakMode: useCallback((mode) => {
      dispatch({ type: ActionTypes.SET_AD_BREAK_MODE, payload: mode });
    }, [dispatch]),

    setAdBreakTimeLeft: useCallback((timeLeft) => {
      dispatch({ type: ActionTypes.SET_AD_BREAK_TIME_LEFT, payload: timeLeft });
    }, [dispatch]),

    setNextAdBreakIn: useCallback((time) => {
      dispatch({ type: ActionTypes.SET_NEXT_AD_BREAK_IN, payload: time });
    }, [dispatch]),

    startTimer: useCallback(() => {
      dispatch({ type: ActionTypes.START_TIMER });
    }, [dispatch]),

    stopTimer: useCallback(() => {
      dispatch({ type: ActionTypes.STOP_TIMER });
    }, [dispatch]),

    // Playlist actions
    setPlaylistUrl: useCallback((url) => {
      dispatch({ type: ActionTypes.SET_PLAYLIST_URL, payload: url });
    }, [dispatch]),

    setPlaylistInfo: useCallback((info) => {
      dispatch({ type: ActionTypes.SET_PLAYLIST_INFO, payload: info });
    }, [dispatch]),

    setPlaylistProvider: useCallback((provider) => {
      dispatch({ type: ActionTypes.SET_PLAYLIST_PROVIDER, payload: provider });
    }, [dispatch]),

    setPlaylistShuffle: useCallback((shuffle) => {
      dispatch({ type: ActionTypes.SET_PLAYLIST_SHUFFLE, payload: shuffle });
    }, [dispatch]),

    setYoutubeUrl: useCallback((url) => {
      dispatch({ type: ActionTypes.SET_YOUTUBE_URL, payload: url });
    }, [dispatch]),

    // UI actions
    toggleVisualizer: useCallback((enabled) => {
      dispatch({ type: ActionTypes.TOGGLE_VISUALIZER, payload: enabled });
    }, [dispatch]),

    setVisualizerType: useCallback((type) => {
      dispatch({ type: ActionTypes.SET_VISUALIZER_TYPE, payload: type });
    }, [dispatch]),

    setVisualizerBlur: useCallback((blur) => {
      dispatch({ type: ActionTypes.SET_VISUALIZER_BLUR, payload: blur });
    }, [dispatch]),

    toggleFloatingPlayer: useCallback((show) => {
      dispatch({ type: ActionTypes.TOGGLE_FLOATING_PLAYER, payload: show });
    }, [dispatch]),

    toggleDeveloperDashboard: useCallback((show) => {
      dispatch({ type: ActionTypes.TOGGLE_DEVELOPER_DASHBOARD, payload: show });
    }, [dispatch]),

    // Settings actions
    setFadeAudioStreams: useCallback((enabled) => {
      dispatch({ type: ActionTypes.SET_FADE_AUDIO_STREAMS, payload: enabled });
    }, [dispatch]),

    setUseCommunityTimings: useCallback((enabled) => {
      dispatch({ type: ActionTypes.SET_USE_COMMUNITY_TIMINGS, payload: enabled });
    }, [dispatch]),

    setAdBreakSettings: useCallback((settings) => {
      dispatch({ type: ActionTypes.SET_AD_BREAK_SETTINGS, payload: settings });
    }, [dispatch]),

    // Community timing actions
    setCommunityTimingState: useCallback((used, timing) => {
      dispatch({
        type: ActionTypes.SET_COMMUNITY_TIMING_STATE,
        payload: { used, timing }
      });
    }, [dispatch]),

    showFeedbackPopup: useCallback((stationName) => {
      dispatch({ type: ActionTypes.SHOW_FEEDBACK_POPUP, payload: stationName });
    }, [dispatch]),

    hideFeedbackPopup: useCallback(() => {
      dispatch({ type: ActionTypes.HIDE_FEEDBACK_POPUP });
    }, [dispatch])
  };
}

export { ActionTypes };
