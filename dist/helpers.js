'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolved = resolved;
exports.rejected = rejected;
exports.fetchJSON = fetchJSON;
exports.buildXML = buildXML;
exports.formatTime = formatTime;
exports.formatDate = formatDate;
exports.parseYoutubeDuration = parseYoutubeDuration;
exports.removeUnsafeCharsAndEmojis = removeUnsafeCharsAndEmojis;

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolved(value) {
  var _q$defer = _q2.default.defer(),
      resolve = _q$defer.resolve,
      promise = _q$defer.promise;

  resolve(value);
  return promise;
}

function rejected(value) {
  var _q$defer2 = _q2.default.defer(),
      reject = _q$defer2.reject,
      promise = _q$defer2.promise;

  reject(value);
  return promise;
}

function fetchJSON(url) {
  return (0, _nodeFetch2.default)(url).then(function (res) {
    return res.json();
  }).then(function (res) {
    if (res.error) throw res.error;else return res;
  });
}

function buildXML(obj) {
  var builder = new _xml2js2.default.Builder();

  try {
    return resolved(builder.buildObject(obj));
  } catch (err) {
    return rejected(err);
  }
}

function formatTime(totalSeconds) {
  var sec_num = parseInt(totalSeconds, 10);

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

  return hours + ':' + minutes + ':' + seconds;
}

function formatDate(date) {
  return (0, _moment2.default)(date).format('ddd, D MMM YYYY hh:mm:ss ZZ');
}

function parseYoutubeDuration(str) {
  var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  var hours = 0,
      minutes = 0,
      seconds = 0,
      totalSeconds = void 0;

  if (reptms.test(str)) {
    var matches = reptms.exec(str);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  }

  return totalSeconds;
}

function removeUnsafeCharsAndEmojis(unsafeStringWithEmoji) {
  var unsafeCharMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  var emojiRanges = ['\uD83C[\uDF00-\uDFFF]', '\uD83D[\uDC00-\uDE4F]', '\uD83D[\uDE80-\uDEFF]'];

  var safeStringWithEmoji = String(unsafeStringWithEmoji).replace(/[&<>"'\/]/g, function (s) {
    return unsafeCharMap[s];
  });
  var safeStringWithoutEmoji = safeStringWithEmoji.replace(new RegExp(emojiRanges.join('|'), 'g'), '');

  return safeStringWithoutEmoji;
}