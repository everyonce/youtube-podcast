import express from 'express';
import config from 'config';
import { log, cleanURL } from './helpers';
import buildFeed from './feed';
import { getVideoDownloadURL } from './youtube';

const PORT = config.get('port');
const BASE_PATH = config.get('base_path');
const app = express();

export default app;

app.get(cleanURL('/' + BASE_PATH + '/channel'), function(req, res)
{
	let id = req.query.id;

	return buildFeed(id, function(err, xml)	
	{
		if(err)
		{
			log.error(JSON.stringify(err, null, 2));
			return res.send(err);
		}

		log.success('RSS successfully created for channel ' + id);
		return res.send(xml);
	});
});

app.get(cleanURL('/' + BASE_PATH + '/video'), function(req, res)
{
	let id = req.query.id;

	return getVideoDownloadURL(id, function(err, url)
	{
		if(err)
		{
			log.error(JSON.stringify(err, null, 2));
			return res.send(err);
		}

		log.success('Redirecting to video ' + id);
		return res.redirect(301, url);
	});
});

app.start = () => app.listen(PORT, () => log.success('Server listening on port ' + PORT));