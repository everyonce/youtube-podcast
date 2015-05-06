import Feed from './youtube/feed.js';
import helpers from './helpers.js';

let channel = 'UCEWHPFNilsT0IfQfutVzsag';
let feed = new Feed(channel);

feed.build().then(
(xml) =>
{
	helpers.log_success(xml);
},
(error) =>
{
	helpers.log_error(error);
});