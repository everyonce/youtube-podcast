import ytdl from 'ytdl-core';
import Q from 'q';
import helpers from '../helpers.js';

//import config from '../config.js';
var fs = require('fs');
var cfile = '../config_env.js';
if (fs.existsSync('./config.js')) {
	cfile = '../config.js';
}
var config = require(cfile);

var NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: config.config.cache_ttl, checkperiod: 600 } );

const API_KEY = config.config.youtube_api_key;
const API_MAX_VIDEOS = config.config.max_videos;
const API_URL = 'https://www.googleapis.com/youtube/v3/';
const DOWNLOAD_URL = config.config.base_url + '/' + config.config.base_path + '/video?id=';

let Youtube = {
	getChannelInfo: (channelId) =>
	{
		var ckey = "getChannelInfo"+ channelId;
		var value = myCache.get(ckey);
		if ( value !== undefined ){
			helpers.log_info('Getting info for channel  (cached) ' + channelId);
			return value;
		}
	
		helpers.log_info('Getting info for channel ' + channelId);

		let url = API_URL + 'channels?part=snippet&id=' + channelId + '&key=' + API_KEY;
		return helpers.request(url).then((response) =>
		{
			let result = JSON.parse(response);
			let info = result.items[0].snippet;

			var channeldata = {
				title:			info.title,
				description:	info.description,
				publishedAt:	helpers.formatDate(info.publishedAt),
				site:			'https://www.youtube.com/channel/' + channelId,
				thumbnail:		info.thumbnails.high.url
			};
			
			var success = myCache.set(ckey, channeldata);
			if (!success) {
				helpers.log_info("cache failed with: " + success);
			}
			
			return channeldata;
		});
	},
	
	getChannelVideosData : (channelId) =>
	{

		var def = Q.defer();
		
		var ckey = "getChannelVideosData"+ channelId;
		var value = myCache.get(ckey);
		if ( value !== undefined ){
			helpers.log_info('Getting videos data for channel (cached) ' + channelId);		
			def.resolve(value);
			return def.promise;
		}
			
		helpers.log_info('Getting videos data for channel ' + channelId);		
		let url = API_URL + 'search?order=date&part=snippet&fields=items&channelId=' + channelId + '&maxResults='+API_MAX_VIDEOS+'&key=' + API_KEY;
		helpers.request(url).then((response) =>
		{
			var channelvideodata = JSON.parse(response);
			var success = myCache.set(ckey, channelvideodata);
			if (!success) {
				def.reject("cache failed with: " + success);
			} else
				def.resolve(channelvideodata);
		});	
		return def.promise;
	},
	
	getChannelVideos: (channelId) =>
	{
		helpers.log_info('Getting videos for channel ' + channelId);
		
		return Youtube.getChannelVideosData(channelId).then((result) =>
		{	
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
		//helpers.log_info("enter getVideoInfo: " + videoId);
		var ckey = "getVideoInfo"+ videoId;
		var value = myCache.get(ckey);
		if ( value !== undefined ){
			helpers.log_info('Getting info for video (cached) ' + videoId);
			return value;
		}

		helpers.log_info('Getting info for video ' + videoId);
		let url = API_URL + 'videos?part=snippet%2CcontentDetails&id=' + videoId + '&maxResults='+API_MAX_VIDEOS+'&key=' + API_KEY;
		return helpers.request(url).then((response) =>
		{
			let result = JSON.parse(response);
			let info = result.items[0].snippet;
			let duration = helpers.parseYoutubeDuration(result.items[0].contentDetails.duration);

			var videodata = {
				title:			info.title,
				description:	info.description,
				thumbnail:		info.thumbnails.standard.url,
				downloadURL:	helpers.cleanURL(DOWNLOAD_URL + videoId),
				type:			'video/mp4',
				length:			0,
				publishedAt:	helpers.formatDate(info.publishedAt),
				duration:		helpers.formatTime(duration)
			};
			var success = myCache.set(ckey, videodata);
			if (!success) {
				helpers.log_info("cache failed with: " + success);
			}	
			return videodata;
		});
	},
	getVideoDownloadURL: (videoId) =>
	{
		var ckey = "getVideoDownloadURL"+ videoId;
		var value = myCache.get(ckey);
		if ( value !== undefined ){
			helpers.log_info('Getting download URL for video (cached) ' + videoId);
			return value;
		}

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
				var murl = info.formats[0].url;
				var success = myCache.set(ckey, murl);
				if (!success) {
					helpers.log_info("cache failed with: " + success);
				}	
				def.resolve(murl);
			}
		});

		return def.promise;
	}
}

export default Youtube;