"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var async = _interopRequire(require("async"));

var buildFeed = _interopRequire(require("./feed"));

var Youtube = _interopRequire(require("./youtube"));

var YoutubePodcast = (function () {
	function YoutubePodcast(config) {
		_classCallCheck(this, YoutubePodcast);

		this.buildURLFunction = config.buildURLFunction;

		this.youtube = new Youtube({
			apiKey: config.apiKey,
			maxVideos: config.maxVideos,
			cacheTTL: config.cacheTTL
		});
	}

	_createClass(YoutubePodcast, {
		_getChannelInfoAndVideos: {
			value: function _getChannelInfoAndVideos(channelId, callback) {
				var _this = this;

				return async.series([function (next) {
					return _this.youtube.getChannelInfo(channelId, next);
				}, function (next) {
					return _this.youtube.getChannelVideos(channelId, next);
				}], callback);
			}
		},
		feedForUser: {
			value: function feedForUser(username, callback) {
				var _this = this;

				return async.waterfall([function (next) {
					return _this.youtube.getChannelIdFromUsername(username, next);
				}, function (channelId, next) {
					return _this._getChannelInfoAndVideos(channelId, next);
				}, function (infoAndVideos, next) {
					return buildFeed(infoAndVideos[0], infoAndVideos[1], _this.buildURLFunction, next);
				}], callback);
			}
		},
		feedForChannel: {
			value: function feedForChannel(channelId, callback) {
				var _this = this;

				return async.waterfall([function (next) {
					return _this._getChannelInfoAndVideos(channelId, next);
				}, function (infoAndVideos, next) {
					return buildFeed(infoAndVideos[0], infoAndVideos[1], _this.buildURLFunction, next);
				}], callback);
			}
		},
		video: {
			value: function video(videoId, callback) {
				return this.youtube.getVideoDownloadURL(videoId, callback);
			}
		}
	});

	return YoutubePodcast;
})();

module.exports = YoutubePodcast;