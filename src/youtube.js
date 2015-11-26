import ytdl from 'ytdl-core';
import async from 'async';
import NodeCache from 'node-cache';
import { log, request, parseYoutubeDuration, formatDate, formatTime } from './helpers';

const API_URL = 'https://www.googleapis.com/youtube/v3/';

export default class Youtube
{
	constructor(config)
	{
		this.config = config;

		this.cache = new NodeCache(
		{
			stdTTL: config.cacheTTL,
			checkperiod: 600
		});
	}

	getChannelInfo(channelId, callback)
	{
		let { maxVideos, apiKey } = this.config;
		let cache = this.cache;

		let url			= API_URL + 'channels?part=snippet&id=' + channelId + '&key=' + apiKey;
		let cacheKey	= 'channel_info_' + channelId;
		let channelInfo	= cache.get(cacheKey);

		if(channelInfo)
		{
			log.info('Getting info for channel ' + channelId + ' from cache');
			return callback(null, channelInfo);
		}

		log.info('Fetching info for channel ' + channelId);

		return request(url, function(err, response)
		{
			if(err) return callback(err);

			let info = response.items[0].snippet;
			
			channelInfo =
			{
				title:			info.title,
				description:	info.description,
				publishedAt:	formatDate(info.publishedAt),
				site:			'https://www.youtube.com/channel/' + channelId,
				thumbnail:		info.thumbnails.high.url
			};
			
			cache.set(cacheKey, channelInfo);
			return callback(null, channelInfo);
		});
	}

	getChannelVideos(channelId, callback)
	{
		let { maxVideos, apiKey, buildDownloadUrl } = this.config;
		let cache = this.cache;

		let cacheKey = 'channel_videos_' + channelId;
		let videos = cache.get(cacheKey);

		if(videos)
		{
			log.info('Getting videos for channel ' + channelId + ' from cache');		
			return callback(null, videos);
		}

		log.info('Fetching videos for channel ' + channelId);

		let getVideoList = function(next)
		{
			log.info('Fetching video list for channel ' + channelId);

			let url = API_URL + 'search?order=date&part=snippet&fields=items&channelId=' + channelId + '&maxResults=' + maxVideos + '&key=' + apiKey;

			return request(url, (err, result) => next(err, err ? null: result.items));	
		};

		let getVideoInfo = function(videoId, next)
		{
			log.info('Fetching info for video ' + videoId + ' from channel ' + channelId);
			
			let url = API_URL + 'videos?part=snippet%2CcontentDetails&id=' + videoId + '&maxResults='+ maxVideos +'&key=' + apiKey;

			return request(url, function(err, response)
			{
				if(err) return next(err);

				try
				{

					let info = response.items[0].snippet;
					let duration = parseYoutubeDuration(response.items[0].contentDetails.duration);
					let videoInfo =
					{
						title:			info.title,
						description:	info.description,
						thumbnail:		info.thumbnails.default.url,
						id:				videoId,
						type:			'video/mp4',
						length:			0,
						publishedAt:	formatDate(info.publishedAt),
						duration:		formatTime(duration)
					};

					return next(null, videoInfo);
				}
				catch(err)
				{
					return next(err);
				}
			});
		};

		return async.waterfall(
		[
			getVideoList,
			(videos, next) =>
			{
				return async.parallel(videos.filter((video) => video.id.videoId).map(function(video)
				{
					return (next) => getVideoInfo(video.id.videoId, next);
				}), next);
			},
			(videos, next) =>
			{
				cache.set(cacheKey, videos);
				return next(null, videos);
			}
		], callback);
	}

	getVideoDownloadURL(videoId, callback)
	{
		let { maxVideos, apiKey } = this.config;
		let cache = this.cache;

		let cacheKey = 'video_download_url_' + videoId;
		let downloadURL = cache.get(cacheKey);

		if(downloadURL)
		{
			log.info('Getting download URL for video ' + videoId + ' from cache');
			return callback(null, downloadURL);
		}

		log.info('Fetching download URL for video ' + videoId);
		
		return ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, { downloadURL: true }, function(err, result)
		{
			if(err) return callback(err);

			downloadURL = result.formats[0].url;
			cache.set(cacheKey, downloadURL);
			return callback(null, downloadURL);
		});
	}

	getChannelIdFromUsername(username, callback)
	{
		let { maxVideos, apiKey } = this.config;
		let cache = this.cache;

		let url = API_URL + 'channels?part=contentDetails&forUsername=' + username + '&key=' + apiKey;
		let cacheKey = 'channel_id_for_username_' + username;
		let channelId = cache.get(cacheKey);

		if(channelId)
		{
			log.info('Getting channel id for user ' + username + ' from cache');
			return callback(null, channelId);
		}

		log.info('Fetching channel id for user ' + username);

		return request(url, function(err, response)
		{
			if(err) return callback(err);

			channelId = response.items[0].id;
			cache.set(cacheKey, channelId);
			return callback(null, channelId);
		});
	}
};



// const API_KEY = config.get('youtube_api_key');
// const API_MAX_VIDEOS = config.get('max_videos');
// const DOWNLOAD_URL = config.get('host') + ':' + config.get('port') + '/' + config.get('base_path') + '/video?id=';
