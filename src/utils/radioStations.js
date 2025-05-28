export const radioStations = {
  'NPO Radio 1': {
    url: 'https://icecast.omroep.nl/radio1-bb-mp3',
    name: 'NPO Radio 1',
    description: 'Nieuws, sport en achtergrond'
  },
  'NPO Radio 2': {
    url: 'https://icecast.omroep.nl/radio2-bb-mp3',
    name: 'NPO Radio 2',
    description: 'De beste muziek en verhalen'
  },
  '3FM': {
    url: 'https://icecast.omroep.nl/3fm-bb-mp3',
    name: '3FM',
    description: 'Alternative, indie en nieuwe muziek'
  },
  'Radio 538': {
    url: 'https://21223.live.streamtheworld.com/RADIO538.mp3',
    name: 'Radio 538',
    description: 'Hitradio voor Nederland'
  },
  'Sky Radio': {
    url: 'https://22433.live.streamtheworld.com/SKYRADIO.mp3',
    name: 'Sky Radio',
    description: 'The Greatest Hits'
  },
  'Q-music': {
    url: 'https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3',
    name: 'Q-music',
    description: 'Q sounds better'
  },
  'Radio Veronica': {
    url: 'https://25603.live.streamtheworld.com/VERONICACMP3.mp3',
    name: 'Radio Veronica',
    description: 'Rock & Pop Classics'
  },
  'SLAM!': {
    url: 'https://25283.live.streamtheworld.com/SLAMFMAAC.aac',
    name: 'SLAM!',
    description: 'Dance & Electronic'
  },
  '100% NL': {
    url: 'https://25603.live.streamtheworld.com/100PNLAAC.aac',
    name: '100% NL',
    description: 'Nederlandse hits'
  }
};

export const getStationList = () => Object.keys(radioStations);
export const getStationData = (stationName) => radioStations[stationName];
