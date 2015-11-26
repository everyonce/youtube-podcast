"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ytdl = _interopRequire(require("ytdl-core"));

var async = _interopRequire(require("async"));

var NodeCache = _interopRequire(require("node-cache"));

var _helpers = require("./helpers");

var log = _helpers.log;
var request = _helpers.request;
var parseYoutubeDuration = _helpers.parseYoutubeDuration;
var formatDate = _helpers.formatDate;
var formatTime = _helpers.formatTime;

var API_URL = "https://www.googleapis.com/youtube/v3/";

var Youtube = (function () {
	function Youtube(config) {
		_classCallCheck(this, Youtube);

		this.config = config;

		this.cache = new NodeCache({
			stdTTL: config.cacheTTL,
			checkperiod: 600
		});
	}

	_createClass(Youtube, {
		getChannelInfo: {
			value: function getChannelInfo(channelId, callback) {
				var _config = this.config;
				var maxVideos = _config.maxVideos;
				var apiKey = _config.apiKey;

				var cache = this.cache;

				var url = API_URL + "channels?part=snippet&id=" + channelId + "&key=" + apiKey;
				var cacheKey = "channel_info_" + channelId;
				var channelInfo = cache.get(cacheKey);

				if (channelInfo) {
					log.info("Getting info for channel " + channelId + " from cache");
					return callback(null, channelInfo);
				}

				log.info("Fetching info for channel " + channelId);

				return request(url, function (err, response) {
					if (err) return callback(err);

					var info = response.items[0].snippet;

					channelInfo = {
						title: info.title,
						description: info.description,
						publishedAt: formatDate(info.publishedAt),
						site: "https://www.youtube.com/channel/" + channelId,
						thumbnail: info.thumbnails.high.url
					};

					cache.set(cacheKey, channelInfo);
					return callback(null, channelInfo);
				});
			}
		},
		getChannelVideos: {
			value: function getChannelVideos(channelId, callback) {
				var _config = this.config;
				var maxVideos = _config.maxVideos;
				var apiKey = _config.apiKey;
				var buildDownloadUrl = _config.buildDownloadUrl;

				var cache = this.cache;

				var cacheKey = "channel_videos_" + channelId;
				var videos = cache.get(cacheKey);

				if (videos) {
					log.info("Getting videos for channel " + channelId + " from cache");
					return callback(null, videos);
				}

				log.info("Fetching videos for channel " + channelId);

				var getVideoList = function getVideoList(next) {
					log.info("Fetching video list for channel " + channelId);

					var url = API_URL + "search?order=date&part=snippet&fields=items&channelId=" + channelId + "&maxResults=" + maxVideos + "&key=" + apiKey;

					return request(url, function (err, result) {
						return next(err, err ? null : result.items);
					});
				};

				var getVideoInfo = function getVideoInfo(videoId, next) {
					log.info("Fetching info for video " + videoId + " from channel " + channelId);

					var url = API_URL + "videos?part=snippet%2CcontentDetails&id=" + videoId + "&maxResults=" + maxVideos + "&key=" + apiKey;

					return request(url, function (err, response) {
						if (err) return next(err);

						try {

							var info = response.items[0].snippet;
							var duration = parseYoutubeDuration(response.items[0].contentDetails.duration);
							var videoInfo = {
								title: info.title,
								description: info.description,
								thumbnail: info.thumbnails["default"].url,
								id: videoId,
								type: "video/mp4",
								length: 0,
								publishedAt: formatDate(info.publishedAt),
								duration: formatTime(duration)
							};

							return next(null, videoInfo);
						} catch (err) {
							return next(err);
						}
					});
				};

				return async.waterfall([getVideoList, function (videos, next) {
					return async.parallel(videos.filter(function (video) {
						return video.id.videoId;
					}).map(function (video) {
						return function (next) {
							return getVideoInfo(video.id.videoId, next);
						};
					}), next);
				}, function (videos, next) {
					cache.set(cacheKey, videos);
					return next(null, videos);
				}], callback);
			}
		},
		getVideoDownloadURL: {
			value: function getVideoDownloadURL(videoId, callback) {
				var _config = this.config;
				var maxVideos = _config.maxVideos;
				var apiKey = _config.apiKey;

				var cache = this.cache;

				var cacheKey = "video_download_url_" + videoId;
				var downloadURL = cache.get(cacheKey);

				if (downloadURL) {
					log.info("Getting download URL for video " + videoId + " from cache");
					return callback(null, downloadURL);
				}

				log.info("Fetching download URL for video " + videoId);

				return ytdl.getInfo("https://www.youtube.com/watch?v=" + videoId, { downloadURL: true }, function (err, result) {
					if (err) return callback(err);

					downloadURL = result.formats[0].url;
					cache.set(cacheKey, downloadURL);
					return callback(null, downloadURL);
				});
			}
		},
		getChannelIdFromUsername: {
			value: function getChannelIdFromUsername(username, callback) {
				var _config = this.config;
				var maxVideos = _config.maxVideos;
				var apiKey = _config.apiKey;

				var cache = this.cache;

				var url = API_URL + "channels?part=contentDetails&forUsername=" + username + "&key=" + apiKey;
				var cacheKey = "channel_id_for_username_" + username;
				var channelId = cache.get(cacheKey);

				if (channelId) {
					log.info("Getting channel id for user " + username + " from cache");
					return callback(null, channelId);
				}

				log.info("Fetching channel id for user " + username);

				return request(url, function (err, response) {
					if (err) return callback(err);

					channelId = response.items[0].id;
					cache.set(cacheKey, channelId);
					return callback(null, channelId);
				});
			}
		}
	});

	return Youtube;
})()

// const API_KEY = config.get('youtube_api_key');
// const API_MAX_VIDEOS = config.get('max_videos');
// const DOWNLOAD_URL = config.get('host') + ':' + config.get('port') + '/' + config.get('base_path') + '/video?id=';
;

module.exports = Youtube;