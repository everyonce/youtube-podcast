import async from 'async';
import buildFeed from './feed';
import Youtube from './youtube';

export default class YoutubePodcast
{
	constructor(config)
	{
		this.buildURLFunction = config.buildURLFunction;

		this.youtube = new Youtube(
		{
			apiKey: config.apiKey,
			maxVideos: config.maxVideos,
			cacheTTL: config.cacheTTL
		});
	}

	_getChannelInfoAndVideos(channelId, callback)
	{
		return async.series(
		[
			(next) => this.youtube.getChannelInfo(channelId, next),
			(next) => this.youtube.getChannelVideos(channelId, next)
		], callback);
	}

	feedForUser(username, callback)
	{
		return async.waterfall(
		[
			(next) => this.youtube.getChannelIdFromUsername(username, next),
			(channelId, next) => this._getChannelInfoAndVideos(channelId, next),
			(infoAndVideos, next) => buildFeed(infoAndVideos[0], infoAndVideos[1], this.buildURLFunction, next)
		], callback);
	}

	feedForChannel(channelId, callback)
	{
		return async.waterfall(
		[
			(next) => this._getChannelInfoAndVideos(channelId, next),
			(infoAndVideos, next) => buildFeed(infoAndVideos[0], infoAndVideos[1], this.buildURLFunction, next)
		], callback);
	}

	video(videoId, callback)
	{
		return this.youtube.getVideoDownloadURL(videoId, callback);
	}
};