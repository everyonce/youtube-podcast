"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.request = request;
exports.parseXML = parseXML;
exports.buildXML = buildXML;
exports.formatTime = formatTime;
exports.formatDate = formatDate;
exports.parseYoutubeDuration = parseYoutubeDuration;
exports.cleanURL = cleanURL;
Object.defineProperty(exports, "__esModule", {
	value: true
});

var colors = _interopRequire(require("colors"));

var xml2js = _interopRequire(require("xml2js"));

var moment = _interopRequire(require("moment"));

var req = _interopRequire(require("request"));

function request(url, callback) {
	return req(url, function (error, response, body) {
		if (error) {
			return callback(error);
		} else {
			if (response.statusCode == 200) {
				return callback(null, JSON.parse(body));
			} else {
				return callback(response);
			}
		}
	});
}

function parseXML(xml, callback) {
	return xml2js.parseString(xml, callback);;
}

function buildXML(obj, callback) {
	try {
		var builder = new xml2js.Builder();
		return callback(null, builder.buildObject(obj));
	} catch (err) {
		return callback(err);
	}
}

function formatTime(totalSeconds) {
	var sec_num = parseInt(totalSeconds, 10); // don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = hours + ":" + minutes + ":" + seconds;
	return time;
}

function formatDate(date) {
	return moment(date).format("ddd, D MMM YYYY hh:mm:ss ZZ");
}

function parseYoutubeDuration(str) {
	var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	var hours = 0,
	    minutes = 0,
	    seconds = 0,
	    totalseconds;

	if (reptms.test(str)) {
		var matches = reptms.exec(str);
		if (matches[1]) hours = Number(matches[1]);
		if (matches[2]) minutes = Number(matches[2]);
		if (matches[3]) seconds = Number(matches[3]);
		totalseconds = hours * 3600 + minutes * 60 + seconds;
	}

	return totalseconds;
}

function cleanURL(url) {
	var protocol = "";
	var rest = "";

	if (url.substr(0, 1) == "/") {
		protocol = "/";
	}

	switch (url.substr(0, 5)) {
		case "http:":
			protocol = "http://";
			rest = url.substr(7);
			break;
		case "https":
			protocol = "https://";
			rest = url.substr(8);
			break;
		default:
			rest = url;
	}

	rest = rest.split("/").filter(function (part) {
		return part != "";
	}).join("/");

	return protocol + rest;
}

var log = {
	success: function success(message) {
		if (message == null || typeof message === "undefined") message = "undefined";
		console.log(message.toString().bold.green);
	},
	error: function error(message) {
		if (message == null || typeof message === "undefined") message = "undefined";
		console.log(message.toString().bold.red);
	},
	info: function info(message) {
		if (message == null || typeof message === "undefined") message = "undefined";
		console.log(message.toString().bold.blue);
	}
};
exports.log = log;