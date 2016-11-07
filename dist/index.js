'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCache = createCache;
exports.buildFeedForChannel = buildFeedForChannel;
exports.buildFeedForUser = buildFeedForUser;
exports.getVideo = getVideo;

var _feed = require('./feed');

var _feed2 = _interopRequireDefault(_feed);

var _youtube = require('./youtube');

var youtube = _interopRequireWildcard(_youtube);

var _nodeCache = require('node-cache');

var _nodeCache2 = _interopRequireDefault(_nodeCache);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createCache() {
  var ttl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1800;

  return new _nodeCache2.default({ stdTTL: ttl, checkperiod: 600 });
}

function buildFeedForChannel(cache, config, channelId) {
  return _q2.default.all([youtube.getChannelInfo(cache, config, channelId), youtube.getChannelVideos(cache, config, channelId)]).spread(function (info, videos) {
    return (0, _feed2.default)(info, videos, config.urlBuilder);
  });
}

function buildFeedForUser(cache, config, username) {
  return youtube.getChannelIdFromUsername(cache, config, username).then(function (channelId) {
    return buildFeedForChannel(cache, config, channelId);
  });
}

function getVideo(videoId) {
  return youtube.getVideoDownloadURL(videoId);
}