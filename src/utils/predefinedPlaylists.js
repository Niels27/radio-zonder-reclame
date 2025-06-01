// Predefined YouTube playlists for randomization

export const predefinedYouTubePlaylists = [
  {
    url: 'https://youtube.com/playlist?list=PLNj0pBssoTE9MducJoC0aBoHFxrxHwqKq&si=L2UiROg7W41C2drc',
    name: 'Top 2000 2022'
  }
];

export const predefinedSpotifyPlaylists = [
  {
    url: 'https://open.spotify.com/playlist/1e9kPHz71pVejGnEywMJuP?si=8453889638c8417b',
    name: 'Top 2000 2022'
  }
];

export const getRandomYouTubePlaylist = () => {
  const randomIndex = Math.floor(Math.random() * predefinedYouTubePlaylists.length);
  return predefinedYouTubePlaylists[randomIndex];
};

export const getRandomSpotifyPlaylist = () => {
  const randomIndex = Math.floor(Math.random() * predefinedSpotifyPlaylists.length);
  return predefinedSpotifyPlaylists[randomIndex];
};
