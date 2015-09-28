import ytdl from 'ytdl-core';
import config from 'config';
import async from 'async';
import NodeCache from 'node-cache';
import { log, request, parseYoutubeDuration, cleanURL, formatDate, formatTime } from './helpers';

const API_URL = 'https://www.googleapis.com/youtube/v3/';
const API_KEY = config.get('youtube_api_key');
const API_MAX_VIDEOS = config.get('max_videos');
const DOWNLOAD_URL = config.get('host') + ':' + config.get('port') + '/' + config.get('base_path') + '/video?id=';

let cache = new NodeCache(
{
	stdTTL: config.get('cache_ttl'),
	checkperiod: 600
});

export function getChannelInfo(channelId, callback)
{
	let url			= API_URL + 'channels?part=snippet&id=' + channelId + '&key=' + API_KEY;
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

export function getChannelVideos(channelId, callback)
{
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

		let url = API_URL + 'search?order=date&part=snippet&fields=items&channelId=' + channelId + '&maxResults=' + API_MAX_VIDEOS + '&key=' + API_KEY;
		return request(url, (err, result) => next(err, err ? null: result.items));	
	};

	let getVideoInfo = function(videoId, next)
	{
		log.info('Fetching info for video ' + videoId + ' from channel ' + channelId);
		
		let url = API_URL + 'videos?part=snippet%2CcontentDetails&id=' + videoId + '&maxResults='+API_MAX_VIDEOS+'&key=' + API_KEY;
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
					downloadURL:	cleanURL(DOWNLOAD_URL + videoId),
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

export function getVideoDownloadURL(videoId, callback)
{
	let cacheKey = 'video_download_url_' + videoId;
	let downloadURL = cache.get(cacheKey);

	if(downloadURL)
	{
		log.info('Getting download URL for video ' + videoId + ' cache');
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