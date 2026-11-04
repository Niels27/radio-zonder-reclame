// src/utils/youtubeUtils.js - YouTube URL helpers

/**
 * Extract the playlist ID (the `list` parameter) from a YouTube URL, or null if there is none.
 */
export const extractPlaylistId = (url) => {
  if (!url) return null;

  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/.*[?&]list=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extract the video ID from a YouTube watch, youtu.be or embed URL, or null if there is none.
 */
export const extractYouTubeVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};
