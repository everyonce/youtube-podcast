import ytdl from 'ytdl-core';
import NodeCache from 'node-cache';
import q from 'q';
import {
  log,
  fetchJSON,
  parseYoutubeDuration,
  formatDate,
  formatTime,
  resolved
} from './helpers';

const API_URL = 'https://www.googleapis.com/youtube/v3/';

function getVideoList({ maxVideos, apiKey }, channelId) {
  const url = `${API_URL}search?order=date&part=snippet&fields=items&channelId=${channelId}&maxResults=${maxVideos}&key=${apiKey}`;
  return fetchJSON(url).then(({items}) => items);
}

function getVideoInfo({ maxVideos, apiKey }, videoId) {
  const url = `${API_URL}videos?part=snippet%2CcontentDetails&id=${videoId}&maxResults=${maxVideos}&key=${apiKey}`;

  return fetchJSON(url).then(({items}) => {
    const item = items[0];

    if(item) {
      const info = item.snippet;
      const duration = parseYoutubeDuration(item.contentDetails.duration);

      return {
        id: videoId,
        title: info.title,
        description: info.description,
        thumbnail: info.thumbnails.default.url,
        type: 'video/mp4',
        length: 0,
        publishedAt: formatDate(info.publishedAt),
        duration: formatTime(duration)
      };
    }

    return null;
  });
}

export function getChannelInfo(cache, { maxVideos, apiKey }, channelId) {
  const url = `${API_URL}channels?part=snippet&id=${channelId}&key=${apiKey}`;
  const cacheKey = 'channel_info_' + channelId;
  const cachedInfo = cache.get(cacheKey);

  if(cachedInfo) {
    return resolved(cachedInfo);
  }

  return fetchJSON(url)
  .then((response) => response.items[0].snippet)
  .then((snippet) => ({
     title: snippet.title,
     description: snippet.description,
     publishedAt: formatDate(snippet.publishedAt),
     site: 'https://www.youtube.com/channel/' + channelId,
     thumbnail: snippet.thumbnails.high.url
   }))
  .then((info) => {
    cache.set(cacheKey, info);
    return info;
  });
}

export function getChannelVideos(cache, config, channelId) {
  const cacheKey = 'channel_videos_' + channelId;
  const cachedVideos = cache.get(cacheKey);

  if(cachedVideos) {
    return resolved(cachedVideos);
  }

  return getVideoList(config, channelId)
  .then((videos) => (
    q.all(videos.map(({id}) => (
      getVideoInfo(config, id.videoId)
    )))
  ))
  .then((videos) => (
    videos.filter((video) => (video !== null))
  ))
  .then((videos) => {
    cache.set(cacheKey, videos);
    return videos;
  });
};

export function getChannelIdFromUsername(cache, { apiKey }, username) {
  const url = `${API_URL}channels?part=contentDetails&forUsername=${username}&key=${apiKey}`;
  const cacheKey = 'channel_id_for_username_' + username;
  const cachedChannelId = cache.get(cacheKey);

  if(cachedChannelId) {
    return cachedChannelId;
  }

  return fetchJSON(url).then(({items}) => {
    const channelId = items[0].id;
    cache.set(cacheKey, channelId);
    return channelId;
  });
}

export function getVideoDownloadURL(videoId) {
  return q.nfcall(
    ytdl.getInfo,
    `https://www.youtube.com/watch?v=${videoId}`,
    { downloadURL: true }
  )
  .then((response) => response.formats[0].url);
}