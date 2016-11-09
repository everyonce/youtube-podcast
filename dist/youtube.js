'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChannelInfo = getChannelInfo;
exports.getChannelVideos = getChannelVideos;
exports.getChannelIdFromUsername = getChannelIdFromUsername;
exports.getVideoDownloadURL = getVideoDownloadURL;

var _ytdlCore = require('ytdl-core');

var _ytdlCore2 = _interopRequireDefault(_ytdlCore);

var _nodeCache = require('node-cache');

var _nodeCache2 = _interopRequireDefault(_nodeCache);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_URL = 'https://www.googleapis.com/youtube/v3/';

function getVideoList(_ref, channelId) {
  var maxVideos = _ref.maxVideos,
      apiKey = _ref.apiKey;

  var url = API_URL + 'search?order=date&part=snippet&fields=items&channelId=' + channelId + '&maxResults=' + maxVideos + '&key=' + apiKey;
  return (0, _helpers.fetchJSON)(url).then(function (_ref2) {
    var items = _ref2.items;
    return items;
  });
}

function getVideoInfo(_ref3, videoId) {
  var maxVideos = _ref3.maxVideos,
      apiKey = _ref3.apiKey;

  var url = API_URL + 'videos?part=snippet%2CcontentDetails&id=' + videoId + '&maxResults=' + maxVideos + '&key=' + apiKey;

  return (0, _helpers.fetchJSON)(url).then(function (_ref4) {
    var items = _ref4.items;

    var item = items[0];

    if (item) {
      var info = item.snippet;
      var duration = (0, _helpers.parseYoutubeDuration)(item.contentDetails.duration);

      return {
        id: videoId,
        title: info.title,
        description: info.description,
        thumbnail: info.thumbnails.default.url,
        type: 'video/mp4',
        length: 0,
        publishedAt: (0, _helpers.formatDate)(info.publishedAt),
        duration: (0, _helpers.formatTime)(duration)
      };
    }

    return null;
  });
}

function getChannelInfo(cache, _ref5, channelId) {
  var maxVideos = _ref5.maxVideos,
      apiKey = _ref5.apiKey;

  var url = API_URL + 'channels?part=snippet&id=' + channelId + '&key=' + apiKey;
  var cacheKey = 'channel_info_' + channelId;
  var cachedInfo = cache.get(cacheKey);

  if (cachedInfo) {
    return (0, _helpers.resolved)(cachedInfo);
  }

  return (0, _helpers.fetchJSON)(url).then(function (response) {
    return response.items[0].snippet;
  }).then(function (snippet) {
    return {
      title: snippet.title,
      description: snippet.description,
      publishedAt: (0, _helpers.formatDate)(snippet.publishedAt),
      site: 'https://www.youtube.com/channel/' + channelId,
      thumbnail: snippet.thumbnails.high.url
    };
  }).then(function (info) {
    cache.set(cacheKey, info);
    return info;
  });
}

function getChannelVideos(cache, config, channelId) {
  var cacheKey = 'channel_videos_' + channelId;
  var cachedVideos = cache.get(cacheKey);

  if (cachedVideos) {
    return (0, _helpers.resolved)(cachedVideos);
  }

  return getVideoList(config, channelId).then(function (videos) {
    return _q2.default.all(videos.map(function (_ref6) {
      var id = _ref6.id;
      return getVideoInfo(config, id.videoId);
    }));
  }).then(function (videos) {
    return videos.filter(function (video) {
      return video !== null;
    });
  }).then(function (videos) {
    cache.set(cacheKey, videos);
    return videos;
  });
};

function getChannelIdFromUsername(cache, _ref7, username) {
  var apiKey = _ref7.apiKey;

  var url = API_URL + 'channels?part=contentDetails&forUsername=' + username + '&key=' + apiKey;
  var cacheKey = 'channel_id_for_username_' + username;
  var cachedChannelId = cache.get(cacheKey);

  if (cachedChannelId) {
    return (0, _helpers.resolved)(cachedChannelId);
  }

  return (0, _helpers.fetchJSON)(url).then(function (_ref8) {
    var items = _ref8.items;

    var channelId = items[0].id;
    cache.set(cacheKey, channelId);
    return channelId;
  });
}

function getVideoDownloadURL(videoId) {
  return _q2.default.nfcall(_ytdlCore2.default.getInfo, 'https://www.youtube.com/watch?v=' + videoId, { downloadURL: true }).then(function (response) {
    return response.formats[0].url;
  });
}