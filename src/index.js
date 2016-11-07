import buildFeed from './feed';
import * as youtube from './youtube';
import NodeCache from 'node-cache';
import q from 'q';

export function createCache(ttl = 1800) {
  return new NodeCache({ stdTTL: ttl, checkperiod: 600 });
}

export function buildFeedForChannel(cache, config, channelId) {
  return q.all([
    youtube.getChannelInfo(cache, config, channelId),
    youtube.getChannelVideos(cache, config, channelId)
  ])
  .spread((info, videos) => buildFeed(info, videos, config.urlBuilder));
}

export function buildFeedForUser(cache, config, username) {
  return youtube.getChannelIdFromUsername(cache, config, username)
  .then((channelId) => buildFeedForChannel(cache, config, channelId))
}

export function getVideo(videoId) {
  return youtube.getVideoDownloadURL(videoId);
}