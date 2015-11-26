import { buildXML } from './helpers.js';

export default function build(info, videos, buildURLFunction, callback)
{
	let author = info.title;
	let rss =
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
					"href": info.site
				}
			}],
			"lastBuildDate": [info.publishedAt],
			"title": [info.title],
			"itunes:author": [info.title],
			"link": [info.site],
			"description": [info.description],
			"itunes:subtitle": [info.description.substr(0,100) + '...'],
			"itunes:summary": [info.description],
			"language": ["en"],
			"itunes:owner": [
			{
				"itunes:name": [info.title],
				"itunes:email": ['n@n.n']
			}],
			"image": [
			{
				"url": [info.thumbnail],
				"title": [info.title],
				"link": [info.site]
			}],
			"itunes:image": [{ "$": { "href": info.thumbnail } }],
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

	rss.channel[0].item = videos.map(function(video)
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
					"url": buildURLFunction(video.id),
					"type": video.type,
					"length": video.length
				}
			}],
			"guid": [buildURLFunction(video.id)],
			"pubDate": [video.publishedAt],//'Tue, 21 Apr 2015 15:50:25 +0200'
			"category": ["TV & Film"],
			"itunes:explicit": ["no"],
			"itunes:duration": [video.duration],
			"itunes:keywords": ['YouTube']
		};
	});

	return buildXML({ rss }, callback);
}