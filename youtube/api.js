import ytdl from 'ytdl-core';
import Q from 'q';
import helpers from '../helpers.js';
import config from '../config.js';

const API_KEY = config.youtube_api_key;
const API_URL = 'https://www.googleapis.com/youtube/v3/';
const DOWNLOAD_URL = config.base_url + '/' + config.base_path + '/video?id=';

let Youtube = {
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
				site:			'https://www.youtube.com/channel/' + channelId,
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
			
			let promises = result.items.map((item) =>
			{
				return Youtube.getVideoInfo(item.id.videoId);
			});

			return Q.allSettled(promises).then((results) =>
			{
				return results
						.filter((result) => { return result.state == 'fulfilled'; })
						.map((result) => { return result.value; });
			});
		});
	},
	getVideoInfo: (videoId) =>
	{
		helpers.log_info('Getting info for video ' + videoId);

		let url = API_URL + 'videos?part=snippet%2CcontentDetails&id=' + videoId + '&maxResults=15&key=' + API_KEY;
		return helpers.request(url).then((response) =>
		{
			let result = JSON.parse(response);
			let info = result.items[0].snippet;
			let duration = helpers.parseYoutubeDuration(result.items[0].contentDetails.duration);

			return {
				title:			info.title,
				description:	info.description,
				thumbnail:		info.thumbnails.standard.url,
				downloadURL:	helpers.cleanURL(DOWNLOAD_URL + videoId),
				type:			'video/mp4',
				length:			0,
				publishedAt:	helpers.formatDate(info.publishedAt),
				duration:		helpers.formatTime(duration)
			};
		});
	},
	getVideoDownloadURL: (videoId) =>
	{
		helpers.log_info('Getting download URL for video ' + videoId);

		var def = Q.defer();

		ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, { downloadURL: true }, (err, info) =>
		{
			if(err)
			{
				def.reject(err);
			}
			else
			{
				def.resolve(info.formats[0].url);
			}
		});

		return def.promise;
	}
}

export default Youtube;