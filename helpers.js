import Q from 'q';
import colors from 'colors';
import xml2js from 'xml2js';
import moment from 'moment';
import request from 'request';

function serializeArguments(args)
{
	return [].map.call(args, (item) =>
	{
		if(typeof item == 'object' || typeof item == 'array')
		{
			return JSON.stringify(item, null, "\t");
		}

		return item;
	}).join('\n\n');
}

export default {
	parseXML: (xml) =>
	{
		let def = Q.defer();

		xml2js.parseString(xml, (error, result) =>
		{
			if(error) def.reject(error);
			else def.resolve(result);
		});

		return def.promise;
	},
	buildXML: (obj) =>
	{
		let builder = new xml2js.Builder();
		return builder.buildObject(obj);
	},
	formatTime: (totalSeconds) =>
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
	},
	formatDate: (date) =>
	{
		return moment(date).format('ddd, D MMM YYYY hh:mm:ss ZZ');
	},
	request: (url) =>
	{
		let def = Q.defer();

		request(url, (error, response, body) =>
		{
			if(error)
			{
				def.reject(error);
			}
			else
			{
				if(response.statusCode == 200)
				{
					def.resolve(body);
				}
				else
				{
					def.reject('An error occured happend while loading ' + url);
				}
			}
		});

		return def.promise;
	},
	log_success: function()
	{
		let message = serializeArguments(arguments);
		console.log(message.bold.green);
	},
	log_error: function()
	{
		let message = serializeArguments(arguments);
		console.log(message.bold.red);
	},
	log_info: function()
	{
		let message = serializeArguments(arguments);
		console.log(message.bold.blue);
	}
}