import * as YoutubePodcast from '../src/index';

const exit = () => process.exit();
const cache = YoutubePodcast.createCache();
const config = {
  urlBuilder: (videoId) => `http://localhost/video?id=${videoId}`,
  apiKey: 'AIzaSyDK-fBzaiATOKWqbra3ov04j5C6tBX2EpQ',
  maxVideos: 30,
};

YoutubePodcast
.buildFeedForChannel(cache, config, 'UCO1cgjhGzsSYb1rsB4bFe4Q')
.then((res) => console.log('buildFeedForChannel: success'))
.catch((res) => console.log('buildFeedForChannel: error', res));

YoutubePodcast
.buildFeedForUser(cache, config, 'Pirulla25')
.then((res) => console.log('buildFeedForUser: success'))
.catch((res) => console.log('buildFeedForUser: error', res));