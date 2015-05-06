import Youtube from './youtube/api.js';
import helpers from './helpers.js';

let channel = 'UCEWHPFNilsT0IfQfutVzsag';
let video = 'j-PSnhvG5fQ';

// Youtube.getChannelVideos(channel).then(
// (info) =>
// {
// 	helpers.log_success(info);
// },
// (error) =>
// {
// 	helpers.log_error(error);
// });

Youtube.getVideoInfo(video).then(
(info) =>
{
	helpers.log_success(info);
},
(error) =>
{
	helpers.log_error(error);
});