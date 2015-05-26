import express from 'express';

var fs = require('fs');
var cfile = './config_env.js';
if (fs.existsSync('./config.js')) {
	cfile = './config.js';
}
var config = require(cfile);

import helpers from './helpers.js';
import Feed from './youtube/feed.js';
import Video from './youtube/video.js';

const PORT = config.config.port;
let app = express();

app.get(helpers.cleanURL('/' + config.config.base_path + '/channel'), function(req, res)
{
	let id = req.query.id;
	let feed = new Feed(id);

	feed.build().then(
	(xml) =>
	{
		helpers.log_success('RSS successfully created for channel ' + id);
		res.send(xml);
	},
	(error) =>
	{
		error = JSON.stringify(error, null, "\t");
		helpers.log_error(error);
		res.send(error);
	});
});

app.get(helpers.cleanURL('/' + config.config.base_path + '/video'), function(req, res)
{
	let id = req.query.id;
	let video = new Video(id);

	video.getDownloadURL().then(
	(url) =>
	{
		helpers.log_success('Redirecting to video ' + id);
		res.redirect(301, url);
	},
	(error) =>
	{
		error = JSON.stringify(error, null, "\t");
		helpers.log_error(error);
		res.send(error);
	});
});

app.listen(PORT, function()
{
	helpers.log_success('Server listening on port ' + PORT);
});