import fs from 'fs';
import async from 'async';
import buildFeed from '../dist/feed';
import YoutubePodcast from '../dist/index';

let yp = new YoutubePodcast(
{
	buildURLFunction: (videoId) => 'http://teste/' + videoId,
	apiKey: fs.readFileSync(__dirname + '/YOUTUBE_API_KEY'),
	maxVideos: 30,
	cacheTTL: 1800
});

yp.feedForUser('Pirulla25', function(err, xml)
{
	console.log(err || xml);
	process.exit();
});