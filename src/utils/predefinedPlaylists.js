// Predefined YouTube playlists for randomization

export const predefinedPlaylists = [
  {
    url: 'https://youtube.com/playlist?list=PLNj0pBssoTE9MducJoC0aBoHFxrxHwqKq&si=L2UiROg7W41C2drc',
    name: 'Top 2000 2022'
  },
  // Add more playlists here in the future
  // {
  //   url: 'https://youtube.com/playlist?list=ANOTHER_PLAYLIST_ID',
  //   name: 'Another Playlist'
  // }
];

export const getRandomPlaylist = () => {
  const randomIndex = Math.floor(Math.random() * predefinedPlaylists.length);
  return predefinedPlaylists[randomIndex];
};
