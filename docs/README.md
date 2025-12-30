# Dutch Radio Ad-Break Switcher

A minimalistic web application that plays Dutch radio stations and automatically switches to user playlists during ad breaks.

🌐 **Live Demo**: [https://niels27.github.io/no-ads-radio-project/](https://niels27.github.io/no-ads-radio-project/)

## Features

- **Most Dutch Radio Stations**: NPO Radio 1, NPO Radio 2, 3FM, Radio 538, Sky Radio, Q-music, Radio Veronica, SLAM!, 100% NL and many more
- **Automatic Ad Break Detection**: Timer-based system that switches to your playlist during ad breaks
- **YouTube & Spotify Integration**: Use YouTube playlists or Spotify playlists as ad break replacement content
- **Random Playlist Generator**: Built-in dice button for random playlist selection
- **Customizable Timing**: Adjust ad break intervals and duration
- **Clean, Dark UI**: Minimalistic design with responsive grid layout
- **Keyboard Controls**: Spacebar to play/pause
- **Volume Control**: Integrated volume slider
- **Persistent Settings**: Your preferences are saved locally
- **Production Logging**: Smart console logging that's disabled in production builds

## Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **Audio**: HTML5 Audio API + YouTube iframe API
- **Storage**: localStorage for settings persistence
- **No Backend**: Pure client-side application

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages:

1. **Automatic Deployment**: Every push to the `main` branch automatically triggers a GitHub Actions workflow that builds and deploys the site
2. **Manual Deployment**: You can also trigger deployment manually from the Actions tab in your GitHub repository
3. **Build Command**: The deployment uses `npm run build:github` which sets the correct base path for GitHub Pages

#### Setting Up GitHub Pages (if starting fresh):

1. **Repository Settings**: Go to your GitHub repository settings
2. **Pages Section**: Navigate to "Pages" in the left sidebar
3. **Source**: Select "GitHub Actions" as the source
4. **Domain**: Your site will be available at `https://yourusername.github.io/repository-name/`

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
- Installs Node.js and dependencies
- Builds the project with the correct base path
- Deploys to GitHub Pages
- Sets up proper permissions and environment

## Usage

### Basic Radio Listening

1. **Select a Station**: Click on any radio station card to start listening
2. **Play/Pause Controls**: Use the player controls at the bottom or press spacebar
3. **Volume Control**: Adjust volume using the slider in the player

### Setting Up Ad Break Switching

1. **Expand Settings**: Click the arrow in the "Ad Break Settings" section
2. **Configure Timing**:
   - **Ad Break Interval**: How often ad breaks occur (default: 30 minutes)
   - **Ad Break Duration**: How long each ad break lasts (default: 5 minutes)
3. **Add YouTube Playlist**:
   - Go to YouTube and find a playlist you want to use
   - Copy the playlist URL (format: `https://www.youtube.com/playlist?list=PLAYLIST_ID`)
   - Paste it in the "YouTube Playlist URL" field
4. **Start Timer**: Click "Start Timer" to activate ad break mode
5. **Test**: Use "Test Ad Break" to manually trigger an ad break

### Keyboard Shortcuts

- **Spacebar**: Play/Pause current audio

## How It Works

### Ad Break System

The application uses a timer-based system to simulate ad breaks:

1. **Timer Countdown**: When you start listening and have a playlist configured, a countdown timer begins
2. **Automatic Switching**: When the timer reaches zero:
   - Current radio stream is paused
   - YouTube playlist starts playing (hidden player)
   - Ad break indicator appears
3. **Return to Radio**: After the configured duration, the playlist stops and radio resumes
4. **Timer Reset**: The countdown timer resets and the cycle continues

### Audio Sources

- **Radio Streams**: Direct HTTP streams from Dutch radio stations
- **YouTube Playlists**: Uses YouTube iframe API for playlist playback
- **Smart Switching**: Seamlessly switches between radio and playlist

### Data Persistence

- Last played station is remembered
- Ad break settings (timing, playlist URL) are saved
- All settings persist between browser sessions


## Troubleshooting

### Radio Stream Issues

- **Stream Not Loading**: Some streams may be geo-blocked or temporarily unavailable
- **Audio Cuts Out**: Check your internet connection; try refreshing the page
- **CORS Errors**: Some radio streams may have CORS restrictions in certain browsers

### YouTube Playlist Issues

- **Playlist Not Playing**: Ensure the playlist is public and the URL format is correct
- **API Errors**: YouTube iframe API may occasionally fail; try refreshing the page
- **Autoplay Blocked**: Some browsers block autoplay; user interaction may be required

### General Issues

- **Settings Not Saving**: Check if localStorage is enabled in your browser
- **Timer Not Working**: Ensure you have both a radio station playing and a playlist configured
- **Responsive Issues**: The app is optimized for desktop and mobile; try refreshing on layout issues

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may have autoplay restrictions)
- **Mobile Browsers**: Responsive design with touch support

## Future Enhancements

- [x] Spotify playlist integration
- [ ] Real ad detection using audio analysis
- [ ] More radio stations
- [ ] Custom playlist creation
- [ ] Export/import settings
- [ ] Dark/light theme toggle
- [ ] Audio visualizer
- [ ] Sleep timer

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This application is for educational and personal use only. Radio streams are provided by their respective broadcasters and subject to their terms of service. The automatic ad break feature is a simulation and not based on actual ad detection.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
