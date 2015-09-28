import colors from 'colors';
import xml2js from 'xml2js';
import moment from 'moment';
import req from 'request';

export function request(url, callback)
{
	return req(url, function(error, response, body)
	{
		if(error)
		{
			return callback(error);
		}
		else
		{
			if(response.statusCode == 200)
			{
				return callback(null, JSON.parse(body));
			}
			else
			{
				return callback(response);
			}
		}
	});
}

export function parseXML(xml, callback)
{
	return xml2js.parseString(xml, callback);;
}

export function buildXML(obj, callback)
{
	try
	{
		let builder = new xml2js.Builder();
		return callback(null, builder.buildObject(obj));
	}
	catch(err)
	{
		return callback(err);
	}
}

export function formatTime(totalSeconds)
{
	let sec_num = parseInt(totalSeconds, 10); // don't forget the second param
	let hours   = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	let seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	let time    = hours+':'+minutes+':'+seconds;
	return time;
}

export function formatDate(date)
{
	return moment(date).format('ddd, D MMM YYYY hh:mm:ss ZZ');
}

export function parseYoutubeDuration(str)
{
	var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	var hours = 0, minutes = 0, seconds = 0, totalseconds;

	if (reptms.test(str))
	{
		var matches = reptms.exec(str);
		if (matches[1]) hours = Number(matches[1]);
		if (matches[2]) minutes = Number(matches[2]);
		if (matches[3]) seconds = Number(matches[3]);
		totalseconds = hours * 3600  + minutes * 60 + seconds;
	}

	return totalseconds;
}

export function cleanURL(url)
{
	let protocol = '';
	let rest = '';

	if(url.substr(0,1) == '/')
	{
		protocol = '/';
	}

	switch(url.substr(0,5))
	{
		case 'http:':
			protocol = 'http://';
			rest = url.substr(7);
			break;
		case 'https':
			protocol = 'https://';
			rest = url.substr(8);
			break;
		default:
			rest = url;
	}

	rest = rest
			.split('/')
			.filter((part) => { return part != ''; })
			.join('/');

	return protocol + rest;
}

export let log =
{
	success: function(message)
	{
		if(message == null || typeof message === 'undefined') message = 'undefined';
		console.log(message.toString().bold.green);
	},
	error: function(message)
	{
		if(message == null || typeof message === 'undefined') message = 'undefined';
		console.log(message.toString().bold.red);
	},
	info: function(message)
	{
		if(message == null || typeof message === 'undefined') message = 'undefined';
		console.log(message.toString().bold.blue);
	}
}