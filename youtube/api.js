import ytdl from 'ytdl-core';
import Q from 'q';
import helpers from '../helpers.js';
import config from '../config.js';

const API_KEY = config.youtube_api_key;
const API_URL = 'https://www.googleapis.com/youtube/v3/';
const DOWNLOAD_URL = config.base_url + '/' + config.base_path + '/download/';

export default {
	getChannelInfo: (channelId) =>
	{
		helpers.log_info('Getting info for channel ' + channelId);

		let url = API_URL + 'channels?part=snippet&id=' + channelId + '&key=' + API_KEY;
		return helpers.request(url).then((response) =>
		{
			let result = JSON.parse(response);
			let info = result.items[0].snippet;

			return {
				title:			info.title,
				description:	info.description,
				publishedAt:	helpers.formatDate(info.publishedAt),
				thumbnail:		info.thumbnails.high.url
			};
		});
	},
	getChannelVideos: (channelId) =>
	{
		helpers.log_info('Getting videos for channel ' + channelId);

		let url = API_URL + 'search?order=date&part=snippet&fields=items&channelId=' + channelId + '&maxResults=15&key=' + API_KEY;
		return helpers.request(url).then((response) =>
		{
			let result = JSON.parse(response);
			
			// let promises = result.items.map((item) =>
			// {
			// 	return this.getVideoInfo(item.id.videoId);
			// });

			// return Q.allSettled(promises);

			return result.items.map((item) => { return item.id.videoId; });
		});
	},
	getVideoInfo: (videoId) =>
	{
		helpers.log_info('Getting info for video ' + videoId);

		var def = Q.defer();

		ytdl.getInfo('http://www.youtube.com/watch?v=' + videoId, { downloadURL: true }, (error, info) =>
		{
			if(error)
			{
				def.reject(error);
			}
			else
			{
				def.resolve(
				{
					title:			info.title,
					description:	info.description,
					thumbnail:		info.thumbnail_url,
					downloadURL:	DOWNLOAD_URL + videoId,
					type:			'video/' + info.formats[0].container,
					length:			0,
					publishedAt:	helpers.formatDate(info.),
					duration:		helpers.formatTime(info.length_seconds),
				});	
			}
		});

		return def.promise;
	},
	getVideoDownloadURL: (videoId) =>
	{
		return this.getVideoInfo(videoId).then((info) => { return info.formats[0].url });
	}
}