# Dutch Radio Ad-Break Switcher - Complete Codebase File Inventory

## Main Application Files

### `/src/App.jsx`
**Purpose**: Main application component and root-level state management
- Orchestrates the entire application flow and global state
- Manages playlist provider selection (YouTube vs Spotify)
- Handles auto-close overlay settings and visualizer configuration
- Coordinates between audio player and ad break timer systems
- Manages global error handling and notification systems
- Controls scroll-based visualizer positioning (header vs footer)
- Handles station selection logic and manual mode coordination
- Manages developer dashboard access via triple-click authentication

### `/src/main.jsx`
**Purpose**: Application entry point and initial setup
- Initializes React application with StrictMode
- Imports and applies global CSS styles
- Sets up logging control system before any other code runs
- Renders the main App component into the DOM root element

### `/src/index.css`
**Purpose**: Global styles and Tailwind CSS integration
- Imports Tailwind CSS base, components, and utilities
- Defines custom CSS components for radio cards and station elements
- Contains responsive design rules and mobile optimizations
- Includes animation keyframes for various UI effects
- Defines custom utility classes for enhanced pre-roll skip buttons
- Contains pulse animations for status indicators

---

## Core Hook Files

### `/src/hooks/useAudioPlayer.js`
**Purpose**: Primary audio management hook - handles all audio sources
- Manages radio stream playback via HTML5 Audio API
- Integrates YouTube playlist playback through iframe API
- Handles Spotify playlist integration via Web Playback SDK
- Provides unified volume control across all audio sources
- Manages connection timeouts, retry logic, and error recovery
- Handles floating YouTube player state and controls
- Coordinates seamless switching between audio sources
- Manages audio element references for visualizer integration
- Handles production-specific Spotify error management

### `/src/hooks/useAdBreakTimer.js`
**Purpose**: Ad break timing and scheduling system
- Manages dual ad break timers with configurable intervals
- Integrates community timing system with Firebase backend
- Handles three ad break modes: playlist, non-stop, and lofi
- Provides manual test functionality and timer overrides
- Manages ad break session tracking to prevent feedback loops
- Coordinates with audio player for seamless content switching
- Handles cache management for timing data
- Manages feedback popup logic and auto-close functionality

### `/src/hooks/useFavorites.js`
**Purpose**: User favorite stations management
- Provides add/remove functionality for favorite radio stations
- Persists favorites to localStorage with error handling
- Manages favorite station state across application sessions
- Integrates with RadioGrid for favorite display and interaction

---

## Component Files

### `/src/components/AdBreakSettings.jsx`
**Purpose**: Main settings panel for ad break configuration
- Provides collapsible interface for ad break timer settings
- Manages dual timer configuration (two separate ad break intervals)
- Handles playlist provider selection (YouTube vs Spotify)
- Integrates playlist URL validation and information display
- Manages community timing toggle and configuration
- Provides manual test controls and timer override functions
- Handles visualizer settings and auto-close overlay options
- Manages day-specific scheduling with time range controls

### `/src/components/AudioPlayer.jsx`
**Purpose**: Fixed footer audio control interface
- Provides play/pause controls with keyboard shortcut support
- Manages volume control with visual slider interface
- Displays current station information and playback status
- Shows ad break countdown and status indicators
- Handles track navigation for playlist sources
- Provides shuffle control for playlist playback
- Displays current audio source and connection status
- Integrates with visualizer for audio source detection

### `/src/components/RadioGrid.jsx`
**Purpose**: Main radio station browser and selection interface
- Displays radio stations in responsive grid layout
- Provides category filtering and search functionality
- Manages favorite stations with star-based interface
- Handles station logo loading with intelligent fallback system
- Integrates failed station detection and reporting
- Provides real-time station selection and playback
- Manages loading states and error handling for stations

### `/src/components/FloatingYouTubePlayer.jsx`
**Purpose**: Draggable floating YouTube player overlay
- Provides draggable YouTube player with free positioning
- Supports three display modes: minimized, medium, maximized
- Handles mode-specific position snapping for optimal placement
- Manages volume control and shuffle functionality
- Provides smooth drag interactions with grab cursor
- Handles iframe loading states and error recovery
- Integrates with global callback system for overlay coordination

### `/src/components/PlaylistProviderSelector.jsx`
**Purpose**: Playlist provider selection and configuration
- Provides dropdown interface for YouTube vs Spotify selection
- Handles Spotify authentication and playlist loading
- Manages playlist URL validation and information display
- Provides retry functionality for failed playlist operations
- Integrates user playlist browser for Spotify accounts
- Handles loading states and error messaging

### `/src/components/MusicVisualizerSingle.jsx`
**Purpose**: Real-time audio visualization system
- Provides singleton audio manager for efficient resource usage
- Supports multiple visualizer types: bars, waves, electric storm
- Handles smart positioning between header and footer
- Manages Web Audio API integration for frequency analysis
- Provides fallback visualization for non-radio sources
- Handles canvas rendering with hardware acceleration
- Manages cleanup and resource disposal

### `/src/components/VisualizerSettings.jsx`
**Purpose**: Visualizer configuration overlay
- Provides beautiful settings interface for visualizer options
- Handles visualizer type selection with preview descriptions
- Manages blur effect configuration for visualizer
- Provides informational content about visualizer behavior
- Handles settings persistence and real-time updates

### `/src/components/DeveloperDashboard.jsx`
**Purpose**: Comprehensive developer tools and diagnostics
- Provides station reporting and failure tracking system
- Manages URL overrides for failed radio stations
- Handles bulk stream testing and validation
- Provides community timing analytics and statistics
- Manages Firebase demo mode configuration
- Handles data export/import functionality
- Provides console logging control and production toggles

### `/src/components/NotificationSystem.jsx`
**Purpose**: Global notification and toast message system
- Provides toast notifications with multiple types (success, error, info, warning)
- Manages notification lifecycle and auto-dismissal
- Handles global notification exposure for cross-component access
- Provides visual feedback for user actions and system events

### `/src/components/ErrorBoundary.jsx`
**Purpose**: React error boundary for graceful error handling
- Catches and handles JavaScript errors throughout the application
- Provides user-friendly error display with recovery options
- Handles unhandled promise rejections
- Provides error reset functionality and page reload options

### `/src/components/LoadingIndicator.jsx`
**Purpose**: Reusable loading state component
- Provides consistent loading animation across the application
- Supports custom loading messages and progress indicators
- Integrates with application theme and styling

### `/src/components/UserGuide.jsx`
**Purpose**: Interactive user guide and help system
- Provides comprehensive usage instructions
- Handles expandable guide sections with detailed explanations
- Offers troubleshooting tips and browser compatibility information
- Includes developer access instructions

### `/src/components/TimeRangeSlider.jsx`
**Purpose**: Interactive time range selection component
- Provides 24-hour time range slider with draggable handles
- Supports precise time selection with visual ruler
- Handles touch and mouse interactions for mobile compatibility
- Integrates with day-specific scheduling system

### `/src/components/ReportStationButton.jsx`
**Purpose**: Station failure reporting interface
- Provides one-click station failure reporting
- Integrates with Firebase for community error tracking
- Handles user feedback collection for station issues
- Manages reporting state and user feedback

### `/src/components/PlaylistSuggestions.jsx`
**Purpose**: Predefined playlist recommendation system
- Provides curated playlist suggestions for users
- Handles random playlist selection functionality
- Integrates with both YouTube and Spotify playlist systems

### `/src/components/CommunityTimingFeedback.jsx`
**Purpose**: Community ad break timing feedback system
- **Status**: Currently empty file - functionality moved to communityTimings.jsx
- **Original Purpose**: Was intended for user feedback on ad break accuracy

### `/src/components/MusicVisualizer.jsx`
**Purpose**: Legacy visualizer component
- **Status**: Currently empty file - replaced by MusicVisualizerSingle.jsx
- **Original Purpose**: Earlier version of the music visualization system

### `/src/components/PlayerVisualizer.jsx`
**Purpose**: Legacy player-specific visualizer
- **Status**: Currently empty file - functionality integrated into main visualizer
- **Original Purpose**: Player-specific audio visualization component

---

## Utility Files

### `/src/utils/communityTimings.jsx`
**Purpose**: Community-driven ad break timing system
- Manages Firebase integration for community ad break data
- Provides statistical analysis of community timing reports
- Handles intelligent ad break prediction based on historical data
- Manages timing cache and rate limiting for performance
- Provides user feedback collection and submission
- Handles demo mode for safe testing environment

### `/src/utils/spotifyUtils.js`
**Purpose**: Spotify Web API integration and authentication
- Manages Spotify OAuth2 authentication flow
- Handles Spotify Web Playback SDK initialization
- Provides playlist validation and track information
- Manages device activation and playback control
- Handles volume control and shuffle functionality
- Provides error handling for Spotify-specific issues

### `/src/utils/youtubeUtils.js`
**Purpose**: YouTube API integration and playlist handling
- Provides YouTube playlist validation and information extraction
- Handles YouTube iframe API integration
- Manages network request filtering for production environments
- Provides error tracking and spam prevention
- Handles playlist ID extraction from various URL formats

### `/src/utils/firebase.js`
**Purpose**: Firebase backend integration
- Manages Firebase configuration and initialization
- Provides demo mode functionality for safe testing
- Handles data submission and retrieval for community features
- Manages logging throttling for Firebase operations

### `/src/utils/lofiUtils.js`
**Purpose**: Lofi music mode integration and overlay management
- Manages lofi music stream selection and rotation
- Handles YouTube-based lofi stream integration
- Provides overlay positioning and management
- Manages volume synchronization for lofi streams
- Handles failed stream tracking and fallback logic

### `/src/utils/nonstopUtils.js`
**Purpose**: Non-stop radio station management
- Manages rotation through ad-free radio stations
- Provides failed station tracking and avoidance
- Handles random station selection with retry logic
- Manages non-stop station index and cycling

### `/src/utils/radioStreamTester.js`
**Purpose**: Radio station connectivity testing system
- Provides bulk radio station testing functionality
- Handles stream validation and connectivity checks
- Manages CSV-based testing with smart skip logic
- Provides fallback-first testing strategy
- Handles test result reporting and statistics

### `/src/utils/stationReporting.js`
**Purpose**: Radio station failure reporting and tracking
- Manages user reports of failed radio stations
- Provides report storage and retrieval functionality
- Handles error categorization and tracking
- Integrates with developer dashboard for station management

### `/src/utils/logoManager.js`
**Purpose**: Radio station logo management and fallback system
- Provides intelligent logo loading with multiple fallback sources
- Manages high-quality Wikipedia Commons logos for popular stations
- Handles failed logo tracking and alternative URL generation
- Provides logo sharing between related radio stations

### `/src/utils/streamProxy.js`
**Purpose**: Radio stream CORS handling and proxy detection
- Provides CORS-friendly stream URL alternatives
- Handles redirect following for stream URLs
- Manages parallel stream testing for performance
- Provides user feedback during stream testing

### `/src/utils/logger.js`
**Purpose**: Production-safe logging system
- **Status**: Currently empty file - functionality integrated into main app
- **Original Purpose**: Managed console logging control for production builds

### `/src/utils/adSkipUtils.js`
**Purpose**: Enhanced ad-skipping functionality for radio streams
- Provides ad-free stream alternatives for radio stations
- Manages Triple-IT CDN alternatives (known ad-free streams)
- Handles station-specific ad-free stream detection
- Provides automatic pre-roll skip functionality

### `/src/utils/musicDetection.js`
**Purpose**: Experimental music vs advertisement detection
- Provides silence pattern analysis for ad detection
- Handles rhythm analysis for music identification
- Manages global detector to avoid audio context conflicts
- **Status**: Currently disabled - experimental feature

### `/src/utils/audioOnlyPlayer.js`
**Purpose**: Audio-only YouTube player bypassing embedding restrictions
- Provides alternative YouTube playback without video embedding
- Handles audio stream extraction from YouTube content
- Manages Web Audio API integration for audio-only playback
- **Status**: Experimental - not actively used in current implementation

### `/src/utils/popupYouTubePlayer.js`
**Purpose**: Popup-based YouTube player alternative
- Manages popup window YouTube playback
- Provides fallback methods for restricted YouTube content
- Handles user preference storage for popup behavior
- Manages popup window lifecycle and controls

### `/src/utils/predefinedPlaylists.js`
**Purpose**: Curated playlist collections
- Provides predefined YouTube and Spotify playlist collections
- Handles random playlist selection for quick setup
- Manages playlist metadata and descriptions

### `/src/utils/stationOverrides.js`
**Purpose**: Radio station URL override system
- Provides station URL override functionality for failed streams
- Manages browser-based override storage and retrieval
- Handles fallback URL management for problematic stations

### `/src/utils/logoFallback.js`
**Purpose**: Legacy logo fallback system
- Provides logo fallback functionality for failed station logos
- Handles domain extraction and alternative logo generation
- **Status**: Partially superseded by logoManager.js

### `/src/utils/radioStations.js`
**Purpose**: Legacy radio station utilities
- **Status**: Currently empty file - functionality moved to data files
- **Original Purpose**: Radio station data management utilities

### `/src/utils/communityTimings.js`
**Purpose**: Legacy community timing utilities
- **Status**: Currently empty file - functionality moved to communityTimings.jsx
- **Original Purpose**: Community timing data management

### `/src/utils/simpleOverrides.js`
**Purpose**: Simplified override system
- **Status**: Currently empty file - functionality integrated into stationOverrides.js
- **Original Purpose**: Simple station URL override management

---

## Data Files

### `/src/data/allRadioStations.js`
**Purpose**: Comprehensive Dutch radio station database
- Contains 806+ Dutch radio stations auto-generated from Radio-Browser API
- Organized by categories: Popular, Dutch Pop, Rock, Classical, Regional, etc.
- Provides station metadata including names, URLs, logos, and categories
- Includes popular station identification and filtering functions
- Integrates with fallback system for station overrides

### `/src/data/fallbackStations.js`
**Purpose**: Manual station overrides and fallback URLs
- Provides manually curated fallback URLs for failed radio stations
- Contains multiple fallback alternatives per station (tried in order)
- Handles station-specific URL overrides and corrections
- Auto-updated system for maintaining working stream URLs

### `/src/data/failedStations.js`
**Purpose**: Known problematic radio station tracking
- Contains auto-generated list of 283 stations that failed connectivity tests
- Tracks stations that failed all connection attempts including fallbacks
- Used for filtering and avoiding known problematic stations
- Updated through automated testing and user reporting

---

## File Status Summary

### Active Core Files (Essential for functionality):
- **App.jsx, main.jsx** - Application core
- **useAudioPlayer.js, useAdBreakTimer.js** - Primary functionality hooks
- **AdBreakSettings.jsx, AudioPlayer.jsx, RadioGrid.jsx** - Main UI components
- **FloatingYouTubePlayer.jsx, MusicVisualizerSingle.jsx** - Advanced features
- **communityTimings.jsx, spotifyUtils.js, youtubeUtils.js** - External integrations
- **All data files** - Station database and overrides

### Active Utility Files (Supporting functionality):
- **firebase.js, lofiUtils.js, nonstopUtils.js** - Mode-specific utilities
- **radioStreamTester.js, stationReporting.js** - Testing and reporting
- **logoManager.js, streamProxy.js** - Asset and connectivity management

### Legacy/Empty Files (No longer used or placeholder):
- **CommunityTimingFeedback.jsx, MusicVisualizer.jsx, PlayerVisualizer.jsx** - Replaced by newer implementations
- **logger.js, radioStations.js, communityTimings.js, simpleOverrides.js** - Functionality moved elsewhere
- **audioOnlyPlayer.js** - Experimental, not in active use

### Experimental Files (Limited use):
- **musicDetection.js** - Disabled experimental feature
- **popupYouTubePlayer.js** - Alternative playback method
- **adSkipUtils.js** - Enhanced ad-skipping (optional feature)

The codebase demonstrates a well-organized architecture with clear separation of concerns, comprehensive utility systems, and thoughtful integration of multiple external services while maintaining backwards compatibility and graceful fallback systems.
