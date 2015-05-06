import Q from 'q';
import helpers from '../helpers.js';
import Youtube from './api.js';

export default class Feed
{
	constructor(id)
	{
		this.channelId = id;
	}
	build()
	{
		return Q.all(
		[
			this.getChannelInfo(),
			this.getChannelVideos()
		])
		.then(this.onChannelInfoAndVideosReceived.bind(this))
		.then(this.startRSS.bind(this))
		.then(this.addItems.bind(this))
		.then(this.buildXML.bind(this));
	}
	getChannelInfo()
	{
		return Youtube.getChannelInfo(this.channelId);
	}
	getChannelVideos()
	{
		return Youtube.getChannelVideos(this.channelId);
	}
	onChannelInfoAndVideosReceived(result)
	{
		helpers.log_success('Channel info and videos received');
		this.info = result[0];
		this.videos = result[1];
	}
	startRSS()
	{
		helpers.log_info('Building RSS');
		this.rss =
		{
			"$":
			{
				"xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
				"version": "2.0",
				"xmlns:atom": "http://www.w3.org/2005/Atom"
			},
			"channel": [
			{
				"atom:link": [
				{
					"$":
					{
						"rel": "self",
						"type": "application/rss+xml",
						"href": this.info.site
					}
				}],
				"lastBuildDate": [this.info.publishedAt],
				"title": [this.info.title],
				"itunes:author": [this.info.title],
				"link": [this.info.site],
				"description": [this.info.description],
				"itunes:subtitle": [this.info.description.substr(0,100) + '...'],
				"itunes:summary": [this.info.description],
				"language": ["en"],
				"itunes:owner": [
				{
					"itunes:name": [this.info.title],
					"itunes:email": ['n@n.n']
				}],
				"image": [
				{
					"url": [this.info.thumbnail],
					"title": [this.info.title],
					"link": [this.info.site]
				}],
				"itunes:image": [{ "$": { "href": this.info.thumbnail } }],
				"category": [ "TV & Film", "Podcasting" ],
				"itunes:category": [
					{ "$": { "text": "TV & Film" } },
					{
						"$": { "text": "Technology" },
						"itunes:category": [{ "$": { "text": "Podcasting" } }]
					}
				],
				"itunes:explicit": ["no"],
				"item": []
			}]
		};
	}
	addItems()
	{
		helpers.log_info('Adding items to RSS');

		let author = this.info.title;

		this.rss.channel[0].item = this.videos.map((video) =>
		{
			return {
				"title": [video.title],
				"itunes:author": [author],
				"description": [video.description],
				"itunes:subtitle": [video.description.substr(0, 100) + '...'],
				"itunes:summary": [''],
				"enclosure": [
				{
					"$":
					{
						"url": video.downloadURL,
						"type": video.type,
						"length": video.length
					}
				}],
				"guid": [video.downloadURL],
				"pubDate": [video.publishedAt],//'Tue, 21 Apr 2015 15:50:25 +0200'
				"category": ["TV & Film"],
				"itunes:explicit": ["no"],
				"itunes:duration": [video.duration],
				"itunes:keywords": ['YouTube']
			};
		});
	}
	buildXML()
	{
		helpers.log_info('Building RSS XML');
		return helpers.buildXML({ rss: this.rss });
	}
}