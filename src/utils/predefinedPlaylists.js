// Predefined YouTube playlists for randomization

export const predefinedYouTubePlaylists = [
  {
    url: 'https://youtube.com/playlist?list=PLNj0pBssoTE9MducJoC0aBoHFxrxHwqKq&si=L2UiROg7W41C2drc',
    name: 'Top 2000 2022'
  },
  {
    url: 'https://youtube.com/playlist?list=PLrAl6rYgs4IvGFUdGEIRgoJ1-fKSF3iFT',
    name: 'Nederlandse Hits'
  },
  {
    url: 'https://youtube.com/playlist?list=PLBzBwYhHpqLJ3K9xREoGgBPGzhtKJq8Y7',
    name: 'Classic Rock Hits'
  },
  {
    url: 'https://youtube.com/playlist?list=PLls9HNHnyKN8DpJMGxOYCCLfWHmGXaIVb',
    name: 'Pop Hits 2023'
  }
];

export const predefinedSpotifyPlaylists = [
  {
    url: 'https://open.spotify.com/playlist/1e9kPHz71pVejGnEywMJuP?si=8453889638c8417b',
    name: 'Top 2000 2022'
  },
  {
    url: 'https://open.spotify.com/playlist/37i9dQZEVXbKCF6dqVpDkS?si=5f6g7h8i9j0k1l2m',
    name: 'Top 50 - Nederland'
  },
  {
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd?si=3a4b5c6d7e8f9g0h',
    name: 'RapCaviar'
  },
  {
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWUwqnqfLPVeI?si=1i2j3k4l5m6n7o8p',
    name: 'Indie Rock Road Trip'
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
