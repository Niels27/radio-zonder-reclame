# Removed stations

Stations that were removed from the site because none of their streams could be played in the
browser. Kept so it is clear what was dropped and why; a station can be added back to
`src/data/stations.json` once it has a working HTTPS stream (see [STATIONS.md](STATIONS.md)).

`npm run stations:check` appends a row here for every station it removes.

The first 265 rows come from the rebuild of the station list on 2026-11-04: every station
of the old list was tested, alternative stream URLs were searched for (official sites,
Radio-Browser, StreamTheWorld/DPG/NPO servers), and these are the ones without any working
stream. Most of them only offer plain `http://` streams, which browsers block on an HTTPS site.
Bitrate/codec variants of the same station ("KINK 128k aac", "Kink 192k mp3") were not removed
but merged into one station, and are therefore not listed.

| Date | Station | Category | Reason (per stream URL tried) |
|---|---|---|---|
| 2026-11-04 | 076 Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://live.hostingbudget.nl:1220/stream` |
| 2026-11-04 | 181.FM Awesome 80s | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://relay.181.fm:8068/` |
| 2026-11-04 | 181.FM Good Time Oldies | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://relay.181.fm:8056/` |
| 2026-11-04 | 181.FM Power 181 | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://relay.181.fm:8028/` |
| 2026-11-04 | 181.FM The Office | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://relay.181.fm:8028/` |
| 2026-11-04 | 192 Radio Veronica | Commercieel | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-14.stream-server.nl:8030/` |
| 2026-11-04 | 1Twente Enschede | Lokaal | server error (HTTP 503): `https://stream1.icehosting.nl/1twente/stream` |
| 2026-11-04 | 24/7 Classical Radio | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://streams.24-7classical.com/classical` |
| 2026-11-04 | 24/7 LoFi Radio | Non-stop | server unreachable: `https://streams.24-7lofiradio.com/lofi` |
| 2026-11-04 | 2Tunes TuneBot | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://server6.radio-streams.net:8023/stream` |
| 2026-11-04 | 40UP ClassicNL Mindradio | Specialiteit | stream not found (HTTP 404): `https://stream.40upradio.nl/thema1` |
| 2026-11-04 | 40UP ClassicNL Opera | Specialiteit | stream not found (HTTP 404): `https://stream.40upradio.nl/thema3` |
| 2026-11-04 | 40UP ClassicNL Soundtracks | Specialiteit | stream not found (HTTP 404): `https://stream.40upradio.nl/thema2` |
| 2026-11-04 | 80s Hitradio | Specialiteit | connection dropped: `https://s22.myradiostream.com/7728/listen.mp3` |
| 2026-11-04 | ABTT | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-06.stream-server.nl:8600/` |
| 2026-11-04 | AccuRadio Adult Hits | Non-stop | server unreachable: `https://listen.accuradio.com/wp_adulthits.m3u` |
| 2026-11-04 | AccuRadio Chillout | Non-stop | server unreachable: `https://listen.accuradio.com/wp_chillout.m3u` |
| 2026-11-04 | AccuRadio Classic Hits | Non-stop | server unreachable: `https://listen.accuradio.com/wp_classichits.m3u` |
| 2026-11-04 | AccuRadio Mellow Gold | Non-stop | server unreachable: `https://listen.accuradio.com/wp_mellowgold.m3u` |
| 2026-11-04 | AccuRadio Soft Rock | Non-stop | server unreachable: `https://listen.accuradio.com/wp_softrock.m3u` |
| 2026-11-04 | Airplay FM | Specialiteit | server error (HTTP 502): `https://s1.citrus3.com:2000/stream/airplayfm` |
| 2026-11-04 | Alex FM | Specialiteit | stream not found (HTTP 401): `https://stream-33.zeno.fm/txy2thr6wp8uv` |
| 2026-11-04 | Altijd Hitradio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp2.live-streams.nl:8170/altijdhits` |
| 2026-11-04 | Andys80s | Specialiteit | connection dropped: `https://stream02.pcradio.ru/andys_80s-med` |
| 2026-11-04 | Apres Ski Radio | Specialiteit | stream not found (HTTP 404): `https://stream-24.zeno.fm/qqbwd2x8d2zuv?zs=VzE6e4CwROOSeWMCik-I-Q` |
| 2026-11-04 | Armin van Buuren | Specialiteit | invalid HTTPS certificate: `https://stream01.pcradio.ru/Armin_van_buuren-med` |
| 2026-11-04 | Atlanticabreda | Specialiteit | connection dropped: `https://caster05.streampakket.com:2199/tunein/atlantica.pls` |
| 2026-11-04 | Beats from Amsterdam | Lokaal | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://stream.legendhits.nl:8017/stream` |
| 2026-11-04 | beeHollands | Specialiteit | invalid HTTPS certificate: `https://stream.beeradio.nl/hollands` |
| 2026-11-04 | beeRadio | Specialiteit | invalid HTTPS certificate: `https://stream.beeradio.nl/main` |
| 2026-11-04 | Bie Os Radio | Specialiteit | stream plays another station (1Achterhoek) - NLPO platform fallback: `https://nlpo.stream.vip/stein/mp3-192/nlpo` |
| 2026-11-04 | Bierfest Radio | Specialiteit | server unreachable: `https://stream.bierfestradio.com/bierfestradio` |
| 2026-11-04 | BigB21 | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.b21fm.nl:9010/` |
| 2026-11-04 | Blackwwod FM | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-24.stream-server.nl:8326/stream` |
| 2026-11-04 | BoemerangFM | Specialiteit | server error (HTTP 502): `https://radio.mediacp.eu/stream/boemerangfm` |
| 2026-11-04 | BredaNu 2 192k MP3 | Nieuws | stream not found (HTTP 404): `https://icecast.bredanu.nl/bredanu.staging.mp3` |
| 2026-11-04 | BredaNu 2 96k AAC | Nieuws | stream not found (HTTP 404): `https://icecast.bredanu.nl/bredanu.staging.aac` |
| 2026-11-04 | C-Dance | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: returns a web page instead of audio: `http://s45.myradiostream.com:18304/` |
| 2026-11-04 | C-Dance RETRO | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: returns a web page instead of audio: `http://s45.myradiostream.com:18304/` |
| 2026-11-04 | Calypso AM 675 | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://178.19.116.3:8016/stream` |
| 2026-11-04 | Centrum Radio | Nieuws | stream not found (HTTP 404): `https://stream.centrumradio.eu/centrumradio.aac` |
| 2026-11-04 | Chérie 80s | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://cdn.nrjaudio.fm/adwz1/fr/30237/mp3_128.mp3` |
| 2026-11-04 | Chérie 90s | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://cdn.nrjaudio.fm/adwz1/fr/30239/mp3_128.mp3` |
| 2026-11-04 | ChillHop Radio | Non-stop | server unreachable: `https://streams.chillhop.com/chillhop` |
| 2026-11-04 | Chillout Lounge | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://ice.somafm.com/chilloutlounge` |
| 2026-11-04 | Classic FM | Publiek | stream not found (HTTP 403): `https://25553.live.streamtheworld.com/CLASSICFM.mp3` |
| 2026-11-04 | Clubstitute Radio | Specialiteit | server error (HTTP 502): `https://stream01.eliveld-ict.nl/listen/clubstitute_radio/radio.mp3` |
| 2026-11-04 | Concertzender | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/live` |
| 2026-11-04 | Concertzender - De Gehoorde Stilte | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/gehoordestilte` |
| 2026-11-04 | Concertzender - Hard Bop | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/hardbop` |
| 2026-11-04 | Concertzender Baroque | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/barok` |
| 2026-11-04 | Concertzender Crosslinks | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/pop` |
| 2026-11-04 | Concertzender De Gehoorde Stilte | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/gehoordestilte` |
| 2026-11-04 | Concertzender De Muzikant | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/amateurmuziek` |
| 2026-11-04 | Concertzender Filmmuziek | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/film` |
| 2026-11-04 | Concertzender Folk it! | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/folkit` |
| 2026-11-04 | Concertzender Geen dag zonder Bach | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/bach` |
| 2026-11-04 | Concertzender Gregoriaans | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/gregoriaans` |
| 2026-11-04 | Concertzender Jazz | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/jazz` |
| 2026-11-04 | Concertzender Jazznotjazz | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/jazznotjazz` |
| 2026-11-04 | ConcertZender Klassieke Muziek | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/klassiek` |
| 2026-11-04 | Concertzender Nieuwe Muziek | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/nieuwemuziek` |
| 2026-11-04 | Concertzender November Music | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/novembermusic` |
| 2026-11-04 | Concertzender Orint Express | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/orientexpress` |
| 2026-11-04 | Concertzender Oude Muziek | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/oudemuziek` |
| 2026-11-04 | Concertzender Pop | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/pop` |
| 2026-11-04 | Concertzender Raakvlakken | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/raakvlakken` |
| 2026-11-04 | Concertzender Radiophonics | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/radiophonics` |
| 2026-11-04 | Concertzender Solta a Franga | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/slotaafranga` |
| 2026-11-04 | Concertzender Utrecht Muziek | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/vredenburg` |
| 2026-11-04 | Concertzender Wereldmuziek | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/wereldmuziek` |
| 2026-11-04 | Concertzender X-Rated | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/concertzenderlive` |
| 2026-11-04 | D2BS | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://solid1.streamupsolutions.com:8041/d2bs` |
| 2026-11-04 | Danceradio Den Haag | Lokaal | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://server5.radio-streams.net:8065/` |
| 2026-11-04 | Das radio | Specialiteit | server unreachable: `https://stream2.mfmstreaming.nl:7001/stream` |
| 2026-11-04 | dB962 Amsterdam | Lokaal | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://stream.db962.nl:8030/listen.pls` |
| 2026-11-04 | De Hollandse Piraten Gigant | Specialiteit | stream not found (HTTP 401): `https://dhpgstreaming.nl/proxy/dhpg/stream` |
| 2026-11-04 | Decibel Party Sound of Ibiza | Specialiteit | stream not found (HTTP 404): `https://stream.decibel.nl/04.mp3` |
| 2026-11-04 | Delta Piraat | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://stream.deltafm.nl:8125/listen.pls` |
| 2026-11-04 | Delta Radio Nijmegen | Lokaal | connection dropped: `https://www.deltaradio90.nl/deltaradio90.m3u` |
| 2026-11-04 | Delta Radio Nijmegen Works in Home Assistant | Lokaal | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://streamdelta.lokaalradio.nl:9005/download.mp3` |
| 2026-11-04 | Den Haag Totaal | Lokaal | connection refused: `https://server3.radio-streams.net:18012/denhaagtotaal` |
| 2026-11-04 | Deurne Media Groep | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: returns a web page instead of audio: `http://s22.myradiostream.com:13628/` |
| 2026-11-04 | dizgo radio fm | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv30.live-streams.nl:8079/stream` |
| 2026-11-04 | Dutch Delite Dnb Radio | Specialiteit | connection dropped: `https://radio.dutchdelite.nl/dnb.m3u` |
| 2026-11-04 | EasyListening.com | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://listen.easylistening.com:8000/stream` |
| 2026-11-04 | Echte Piratenhits | Specialiteit | returns a web page instead of audio: `https://echtepiratenhits.com/stream/wmp.asx` |
| 2026-11-04 | Enschede FM | Lokaal | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://stream1.icehosting.nl:8126/` |
| 2026-11-04 | Extra AM | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://caster04.streampakket.com:8047/stream` |
| 2026-11-04 | Extra Gold | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://extragold.stream-server.nl/stream?type=http&nocache=124795` |
| 2026-11-04 | F Test | Specialiteit | test stream, not a radio station: `https://server-67.stream-server.nl:8768/stream` |
| 2026-11-04 | Feel Good Radio 1076 FM | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://live.feelgoodradio.eu:8344/stream` |
| 2026-11-04 | Fidelio Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: returns a web page instead of audio: `http://server3.radio-streams.net:2199/tunein/fidelios-stream.pls` |
| 2026-11-04 | FlevoZiekenOmroep | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://stream.heerema.net/studio?_res_tag_=audio` |
| 2026-11-04 | FlevoZiekenOmroep HLS audio | Specialiteit | HLS only (not supported): `https://video.fzo.nu/live.m3u8` |
| 2026-11-04 | flitsradio | Specialiteit | no response: `https://streamer.hosting078.nl:1835/stream` |
| 2026-11-04 | flitsradio van willem | Specialiteit | no response: `https://streamer.hosting078.nl:1835/stream` |
| 2026-11-04 | Foute Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.dotpoint.nl:8000/fouteradio` |
| 2026-11-04 | Freak31 | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: invalid HTTPS certificate: `http://stream.freak31.com:8322/` |
| 2026-11-04 | Free Musi Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.freemusicradio.nl:8100/stream.oga` |
| 2026-11-04 | Geheime Zender Stream | Specialiteit | stream not found (HTTP 404): `https://mediacp.audiostreamen.nl:2000/stream/8160/stream` |
| 2026-11-04 | Gewoonpiraten altijd gezellig | Specialiteit | stream not found (HTTP 404): `https://server-67.stream-server.nl:8802/stream` |
| 2026-11-04 | GLD - INHOUSE MER DHD | Specialiteit | stream not found (HTTP 404): `https://stream.40upradio.nl/gld` |
| 2026-11-04 | GLXY THROWBACK RADIO | Specialiteit | stream not found (HTTP 404): `https://stream.glxy.radio/GLXY_OG` |
| 2026-11-04 | GLXYRADIO | Specialiteit | invalid HTTPS certificate: `https://stream23.gal.io/GLXY_CF01` |
| 2026-11-04 | GOD Radio | Specialiteit | stream not found (HTTP 404): `https://stream.wildfm.nl/GOD_Radio` |
| 2026-11-04 | Goud van Oud | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://server-23.stream-server.nl:8118/stream` |
| 2026-11-04 | Groeistad Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://213.202.241.176:8564/stream` |
| 2026-11-04 | Happy Sound Music | Specialiteit | connection refused: `https://server-28.stream-server.nl:8918/stream` |
| 2026-11-04 | Happy Sound Music Limburg | Specialiteit | server error (HTTP 502): `https://server-28.stream-server.nl/stream/happysoundmusic` |
| 2026-11-04 | HappyHits | Specialiteit | stream not found (HTTP 404): `https://mediacp.audiostreamen.nl:8150/stream` |
| 2026-11-04 | Hardrock | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-23.stream-server.nl:8326/stream` |
| 2026-11-04 | Hardzone Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://s40.myradiostream.com:23504/listen.mp3`<br>HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://s40.myradiostream.com:23504/listen.pls` |
| 2026-11-04 | Hi On Line | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp2.live-streams.nl:8100/flac.flac` |
| 2026-11-04 | Hi On Line - World | Specialiteit | stream not found (HTTP 404): `https://mediaserv38.live-streams.nl:18027/stream` |
| 2026-11-04 | Hi On Line Jazz Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv38.live-streams.nl:8006/` |
| 2026-11-04 | Hi On Line Latin Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://mediaserv33.live-streams.nl:8034/` |
| 2026-11-04 | Hi On Line Radio - Classical | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv30.live-streams.nl:8088/live` |
| 2026-11-04 | Hi On Line Radio - Flac | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp2.live-streams.nl:8100/flac.flac` |
| 2026-11-04 | Hi On Line Radio - France | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv21.live-streams.nl:8000/live` |
| 2026-11-04 | Hi On Line Radio - Jazz | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv38.live-streams.nl:8006/live` |
| 2026-11-04 | Hi On Line Radio - Latin | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://mediaserv33.live-streams.nl:8034/live` |
| 2026-11-04 | Hi On Line World Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv38.live-streams.nl:8027/live` |
| 2026-11-04 | Hi online | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp2.live-streams.nl:8100/flac.flac` |
| 2026-11-04 | Hit Radio Loz | Specialiteit | invalid HTTPS certificate: `https://loa.beheerstream.nl:8112/stream` |
| 2026-11-04 | Hitradio Centraal FM | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://server-hostingexpert.eu:1040/stream.mp3` |
| 2026-11-04 | Hot Radio Hits | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://www.hotradiohits.nl/include/stream/hotradiohits.m3u` |
| 2026-11-04 | In Tha House | Specialiteit | invalid HTTPS certificate: `https://www.inthahouse.nl/stream` |
| 2026-11-04 | IndieXL | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-23.stream-server.nl:8438/;listen.pls_` |
| 2026-11-04 | Intergalactic FM  CBS TV | Specialiteit | HLS only (not supported): `https://intergalactic.tv/live/smil:tv.smil/playlist.m3u8` |
| 2026-11-04 | Italo Power | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.radioitalopower.com:10018/italopower` |
| 2026-11-04 | Italoradiofm | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://cc6.beheerstream.com:8102/stream` |
| 2026-11-04 | Jazz de Ville - Dance | Specialiteit | server error (HTTP 502): `https://onair22.xdevel.com/proxy/xautocloud_6cqz_422?mp=/stream` |
| 2026-11-04 | Jazz de Ville - Groove | Specialiteit | server error (HTTP 502): `https://onair22.xdevel.com/proxy/xautocloud_1kha_423?mp=/stream` |
| 2026-11-04 | Jazz de Ville - Jazz | Specialiteit | server error (HTTP 502): `https://onair22.xdevel.com/proxy/xautocloud_kkyb_420?mp=/stream` |
| 2026-11-04 | JB Radio 2 | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://cristina.torontocast.com:8007/mp3-320` |
| 2026-11-04 | Joe 60s & 70s | Commercieel | channel URL now redirects to the broadcaster's default stream: `https://icecast-qmusicbe-cdp.triple-it.nl/joe_60s_70s.aac?aw_0_1st.skey=1686378120&aw_0_1st.playerid=site-player` |
| 2026-11-04 | jungletrainnet - 247 drum and bass | Specialiteit | no response: `https://chat.jungletrain.net/streamtest/;stream/1` |
| 2026-11-04 | Keizerstad Radio 80s | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-06.stream-server.nl:8800/` |
| 2026-11-04 | KilRock | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mediaserv30.live-streams.nl:8013/low` |
| 2026-11-04 | KingFM | Specialiteit | returns a web page instead of audio: `https://server-28.stream-server.nl:8870/` |
| 2026-11-04 | KL85 | Specialiteit | connection dropped: `https://s19.myradiostream.com/18068/listen.mp3?sid=1` |
| 2026-11-04 | Laser 101 - 1011 Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://stream.sxmradio.com:8060/channel7.mp3` |
| 2026-11-04 | Laser 1011 FM Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://201.220.14.41:8060/channel7.mp3` |
| 2026-11-04 | LeagueFM | Specialiteit | returns a web page instead of audio: `https://radiopaneel.league-fm.nl/listen/leaguefm/stream` |
| 2026-11-04 | Linn Classical | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://89.16.185.174:8004/stream` |
| 2026-11-04 | Linn Jazz | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://89.16.185.174:8000/stream` |
| 2026-11-04 | LoFi Cafe | Non-stop | server unreachable: `https://stream.lofi.cafe/lofi.mp3` |
| 2026-11-04 | Lokale Omroep Leek LOL FM | Specialiteit | connection dropped: `https://server6.radio-streams.net:2199/tunein/stichti2.pls` |
| 2026-11-04 | Maasbach Radio | Religieus | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.maasbachradio.com:8064/stream` |
| 2026-11-04 | Maasland Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://panel.beheerstream.com:2199/tunein/maaslandradio.pls` |
| 2026-11-04 | Maenda Country | Specialiteit | stream not found (HTTP 404): `https://radio.streampanel.nl/mcraac` |
| 2026-11-04 | MD Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://vps2.sandoz.cloud:8630/radio.mp3` |
| 2026-11-04 | MediaMarkt FM | Specialiteit | invalid HTTPS certificate: `https://stream.cuecreative.nl/mediamarktfm` |
| 2026-11-04 | MusicVaria | Specialiteit | server error (HTTP 500): `https://server-67.stream-server.nl:2000/tunein/MusicVaria/stream/pls` |
| 2026-11-04 | Muziekteam | Specialiteit | connection refused: `https://mcp-1.streampanel.nl:2000/tunein/muziekteam-1/stream/pls` |
| 2026-11-04 | Nashville FM | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-10.stream-server.nl:8300/` |
| 2026-11-04 | Nautic Radio Groningen | Lokaal | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.nauticradio.net:14260/` |
| 2026-11-04 | Niederlande - Radio Erasmus | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://caster02.streampakket.com:8636/stream` |
| 2026-11-04 | Non-stop Geheime zender muziek | Non-stop | server unreachable: `https://stream.geheimezenderstream.nl/stream` |
| 2026-11-04 | NonStopPlay | Non-stop | server unreachable: `https://stream.nonstopplay.com/nsp` |
| 2026-11-04 | Nora FM | Specialiteit | server unreachable: `https://25333.live.streamtheworld.com/NORA_FM.mp3` |
| 2026-11-04 | NoraFM - de Fijnste muziekmix | Specialiteit | stream not found (HTTP 404): `https://caster05.streampakket.com/proxy/rein1234` |
| 2026-11-04 | Nostalgie NL | Specialiteit | stream not found (HTTP 404): `https://playerservices.streamtheworld.com/api/livestream-redirect/NOSTALGIENLAAC.aac` |
| 2026-11-04 | NPO FunX NL | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://icecast.omroep.nl/funx-bb-mp3.m3u` |
| 2026-11-04 | NRJ Love Songs | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://cdn.nrjaudio.fm/adwz1/fr/30207/mp3_128.mp3` |
| 2026-11-04 | Oasis 963 FM Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.sxmradio.com:8060/channel5.mp3` |
| 2026-11-04 | Old Mens Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://server-10.stream-server.nl:8140/` |
| 2026-11-04 | Omroep West | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://icecast.stream.bbvms.com/omroepwest_radio` |
| 2026-11-04 | OnlinepiraatNL | Specialiteit | invalid HTTPS certificate: `https://loa.beheerstream.nl:8016/stream` |
| 2026-11-04 | onverantwoordcom | Specialiteit | invalid HTTPS certificate: `https://loa.beheerstream.nl:8008/stream` |
| 2026-11-04 | OpenLab FM | Non-stop | returns a web page instead of audio: `https://openlab.fm/stream.mp3` |
| 2026-11-04 | Pearl FM 981 Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.sxmradio.com:8060/channel6.mp3` |
| 2026-11-04 | PI2NOS | Specialiteit | amateur radio repeater relay, not a radio station: `https://stream.hobbyscoop.nl/pi2nos` |
| 2026-11-04 | PI3UTR | Specialiteit | amateur radio repeater relay, not a radio station: `https://stream.hobbyscoop.nl/pi3utr` |
| 2026-11-04 | PI4VRZA | Nieuws | amateur radio repeater relay, not a radio station: `https://stream.pi4vrz.nl:9000/webstream.mp3` |
| 2026-11-04 | PinQradio | Specialiteit | connection dropped: `https://s18.myradiostream.com/3194/;?type=http&nocache=1744091383?0.841561797877854` |
| 2026-11-04 | Piraten Stream Twente | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: invalid HTTPS certificate: `http://stream.piratentwente.com:8020/live` |
| 2026-11-04 | Piratenhitsfm | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://mscp3.live-streams.nl:8330/live.ogg` |
| 2026-11-04 | Piratenstream Test1 | Specialiteit | stream not found (HTTP 404): `https://server1.piratenstream.nl/radio/8190/stream.aac` |
| 2026-11-04 | PJD2 The Voice of Sint Maarten 1027 FM | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://142.4.219.8:8181/stream` |
| 2026-11-04 | PJD2 The Voice of Sint Maarten 1300 AM | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://142.4.219.8:8193/stream` |
| 2026-11-04 | PJD3 Power 1027 FM Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://201.220.14.41:8060/channel3.mp3` |
| 2026-11-04 | PJD3 Power 1027 Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.sxmradio.com:8060/channel3.mp3` |
| 2026-11-04 | Platinum Radio HardStyle | Specialiteit | server unreachable: `https://live.platinumradio.nl:8030/radio.mp3` |
| 2026-11-04 | Pure Classix Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp4.live-streams.nl:8140/live.mp3` |
| 2026-11-04 | Pure Twenty Four Pure 24 | Specialiteit | no response: `https://c32.radioboss.fm:8775/stream` |
| 2026-11-04 | Pureclassix | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://server5.radio-streams.net:8001/live` |
| 2026-11-04 | PureClassix Flac | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp4.live-streams.nl:8140/flac.ogg` |
| 2026-11-04 | Q-Dance | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://25273.live.streamtheworld.com/Q_DANCE.mp3` |
| 2026-11-04 | Queer Hits | Specialiteit | server unreachable: `https://stream.queerhits.nl/queerhits.aac` |
| 2026-11-04 | Queer Hits HQ | Specialiteit | server unreachable: `https://stream.queerhits.nl/queerhits.hq` |
| 2026-11-04 | Radio 078 Synth | Specialiteit | connection dropped: `https://panel.beheerstream.com:2199/tunein/ujogqmho.pls` |
| 2026-11-04 | Radio 13 | Publiek | server unreachable: `https://stream2.mfmstreaming.nl/8040/stream` |
| 2026-11-04 | Radio 509 Hilversum | Publiek | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://provisioning.streamtheworld.com/pls/RADIO509AAC.pls` |
| 2026-11-04 | Radio 9 Oostzaan | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://caster01.streampakket.com:9350/;` |
| 2026-11-04 | RADIO ALEX FM DENL | Specialiteit | stream not found (HTTP 404): `https://stream.radiostreamserver.de/listen/alexfm/de-nl.mp3` |
| 2026-11-04 | RADIO ALEX FM ROERMOND | Specialiteit | stream not found (HTTP 404): `https://stream.radiostreamserver.de/listen/alexfm/roermond.mp3` |
| 2026-11-04 | Radio Amersfoort | Nieuws | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://qxjr001.digiplay.nl:9180/stream` |
| 2026-11-04 | Radio Awaaz | Nieuws | connection refused: `https://mediaserv38.live-streams.nl:18039/stream` |
| 2026-11-04 | Radio Beverwijk | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://stream.stream.delivery/beverwijk` |
| 2026-11-04 | Radio Blacklight | Specialiteit | stream not found (HTTP 404): `https://server-28.stream-server.nl:8876/autodj` |
| 2026-11-04 | Radio Bonita | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://live.hostingbudget.nl:1040/stream` |
| 2026-11-04 | Radio Chilling Station | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://mediaserv30.live-streams.nl:8090/stream` |
| 2026-11-04 | Radio De Musketiers | Specialiteit | invalid HTTPS certificate: `https://loa.beheerstream.nl:8022/stream` |
| 2026-11-04 | Radio Deep Underground | Specialiteit | stream not found (HTTP 404): `https://radio.radiodeepunderground.com/listen/radio_deep_underground/rdu-320.mp3` |
| 2026-11-04 | Radio Erasmus | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://caster04.streampakket.com:8636/stream` |
| 2026-11-04 | Radio Exclusief | Specialiteit | invalid HTTPS certificate: `https://cloud-faro.beheerstream.com/proxy/iqienyzy?mp=/stream` |
| 2026-11-04 | Radio Golfbreker | Specialiteit | server error (HTTP 502): `https://mcp-1.streampanel.nl/stream/vdijk` |
| 2026-11-04 | radio Goudenpijl | Specialiteit | no response: `https://hostingbudgeteverestcast.nl:2580/stream` |
| 2026-11-04 | Radio Haarlem | Lokaal | stream not found (HTTP 404): `https://live.radiohaarlem.nl:8000/radio.mp3` |
| 2026-11-04 | Radio Nnnevot | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://i1.cdn.jetstre.am:8000/sz=stichtingradiononnevot=radiostream` |
| 2026-11-04 | Radio Noordvaarder Reiki | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: invalid HTTPS certificate: `http://stream.radionoordvaarder.nl:8050/` |
| 2026-11-04 | Radio Powerline | Specialiteit | no response: `https://server-67.stream-server.nl:8836/stream` |
| 2026-11-04 | Radio Purmerend DAB | Nieuws | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.zxp.nl:8000/radiopurmerend_dab` |
| 2026-11-04 | Radio Regenboog | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://server-28.stream-server.nl:8830/stream` |
| 2026-11-04 | Radio Ridderkerk | Nieuws | stream plays another station (1Achterhoek) - NLPO platform fallback: `https://nlpo.stream.vip/ridderk/mp3-192/nlpo.stream.vip/` |
| 2026-11-04 | Radio Seabreeze AM | Specialiteit | connection refused: `https://mediaserv38.live-streams.nl:2199/tunein/radioseabreeze-stream1.pls` |
| 2026-11-04 | Radio Sputnik Underground! | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://radiosputnik.nl:8002/.m3u` |
| 2026-11-04 | Radio Stad Woerden | Specialiteit | connection refused: `https://server-28.stream-server.nl:8886/stream` |
| 2026-11-04 | Radio Time Out Trance | Specialiteit | connection dropped: `https://s3.slotex.pl/shoutcast/7056/stream` |
| 2026-11-04 | Radio Ultiem | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-21.stream-server.nl:8382/` |
| 2026-11-04 | Radio Van Noord Tot Zuid | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://live.hostingbudget.nl:1800/stream` |
| 2026-11-04 | Radio Verona | Specialiteit | stream not found (HTTP 404): `https://mcp-1.streampanel.nl:8020/RadioVelona` |
| 2026-11-04 | Radio Zuyd | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://radiozuyd.shoutcaststream.com:8199/stream` |
| 2026-11-04 | Radio750 | Specialiteit | stream not found (HTTP 404): `https://solid48.streamupsolutions.com/proxy/ofufrjbi/radio750` |
| 2026-11-04 | Rainz FM | Specialiteit | server unreachable: `https://stream2.mfmstreaming.nl/8032/stream.mp3` |
| 2026-11-04 | RaZO Amsterdam | Lokaal | connection dropped: `https://s42.myradiostream.com/33512/listen.mp3` |
| 2026-11-04 | Reformatorische Omroep 1 | Religieus | connection dropped: `https://radio1.reformatorischeomroep.nl/live.m3u` |
| 2026-11-04 | Rozo Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection refused: `http://server3.radio-streams.net:8007/live` |
| 2026-11-04 | RPL | Nieuws | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://qxjr001.digiplay.nl:9101/stream` |
| 2026-11-04 | RTV Maastricht 1075 | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: invalid HTTPS certificate: `http://stream.rtvmaastricht.nl:8081/rtv/radio_audio/icecast.audio` |
| 2026-11-04 | RTV Maastricht Radio 1075 FM | Publiek | invalid HTTPS certificate: `https://stream.rtvmaastricht.nl/rtv/radio_audio/icecast.audio` |
| 2026-11-04 | RTV Slingeland | Specialiteit | stream not found (HTTP 404): `https://ms2.mx-cd.net/dtv-21/105-567919/Slingeland_FM.smil/playlist.m3u8` |
| 2026-11-04 | RtvAlbrandswaard | Nieuws | no response: `https://streamer.hosting078.nl:1850/stream` |
| 2026-11-04 | Saba Radio Q 939 FM Netherlands | Specialiteit | server unreachable: `https://s1.northrich.nl:38123/streamq939` |
| 2026-11-04 | Salland 747 | Specialiteit | connection refused: `https://radio2.stream24.net:8270/live.mp3` |
| 2026-11-04 | Size Radio | Non-stop | server unreachable: `https://stream.size-radio.com/live` |
| 2026-11-04 | Sky Radio Lounge | Commercieel | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://provisioning.streamtheworld.com/pls/SRGSTR07AAC.pls` |
| 2026-11-04 | Slam Rock Radio | Commercieel | invalid HTTPS certificate: `https://cloud-faro.beheerstream.com/proxy/qohhfiiq?mp=/;` |
| 2026-11-04 | Sleutelstad Radio | Specialiteit | server error (HTTP 502): `https://sleutelstad.radioca.st/stream` |
| 2026-11-04 | Slow Radio | Specialiteit | server unreachable: `https://stream1.slowradio.com/` |
| 2026-11-04 | Smooth Jazz 24/7 | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://relay.181.fm:8008/` |
| 2026-11-04 | SomaFM Beat Blender | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://ice.somafm.com/beatblender` |
| 2026-11-04 | SomaFM Suburbs of Goa | Non-stop | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://ice.somafm.com/suburbsofgoa` |
| 2026-11-04 | SRC FM 2 - Rivierenland en Vijfheerenlanden | Nieuws | invalid HTTPS certificate: `https://loa.beheerstream.nl:8126/stream` |
| 2026-11-04 | Starlicht | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://live.urkfm.nl:8000/urkfm.mp3` |
| 2026-11-04 | Stichting Streekomroep de Bevelanden SOB FM | Nieuws | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://stream.sobfm.nl:8686/stream` |
| 2026-11-04 | Stilok | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streaming1.steigerstudios.nl/stilok-mp3` |
| 2026-11-04 | Studio 040 TV | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://ms7.mx-cd.net/tv/117-475839/Studio040.smil/playlist.m3u8` |
| 2026-11-04 | Studio Emmeloord | Specialiteit | stream not found (HTTP 404): `https://cast.streamkeuze.nl/studioemmeloord` |
| 2026-11-04 | Sunlite | Specialiteit | stream not found (HTTP 404): `https://playerservices.streamtheworld.com/api/livestream-redirect/SUNLITE_MP3.mp3` |
| 2026-11-04 | SuperFM - IJmuiden | Specialiteit | connection dropped: `https://stream.edfm.nl/super` |
| 2026-11-04 | The SID Station | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://173.208.54.18:8144/stream` |
| 2026-11-04 | TraxxRadio | Nieuws | stream not found (HTTP 404): `https://server-28.stream-server.nl:8896/stream` |
| 2026-11-04 | Tropixx FM 1055 Philipsburg | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://stream.sxmradio.com:8060/channel2.mp3` |
| 2026-11-04 | Unique Rock | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://mscp2.live-streams.nl:8180/radio` |
| 2026-11-04 | Urk FM geestelijk | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://urk.fm:8000/geestelijk.mp3` |
| 2026-11-04 | ValleiRadionl | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: connection dropped: `http://server-25.stream-server.nl:8366/stream` |
| 2026-11-04 | WAVE | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: stream not found (HTTP 404): `http://radio.wave.frl/listen/waveradio/radio.mp3` |
| 2026-11-04 | World of Jazz | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: no response: `http://streams.greenhost.nl:8080/jazz` |
| 2026-11-04 | XD Radio | Specialiteit | HTTP only (blocked on an HTTPS page); HTTPS variant: server unreachable: `http://streams.xdradio.nl/stream/xdradio` |
| 2026-11-04 | YouRRadio | Specialiteit | stream not found (HTTP 404): `https://server6.radio-streams.net/proxy/marcel13/stream` |
| 2026-11-04 | ZAP! FM | Specialiteit | invalid HTTPS certificate: `https://zapstream.nl/1` |
| 2026-11-04 | Zwartewater FM | Specialiteit | returns a web page instead of audio: `https://panel.beheerstream.com:2199/tunein/zwartewaterfm-stream.pls` |
