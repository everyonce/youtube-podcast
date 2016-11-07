import xml2js from 'xml2js';
import moment from 'moment';
import fetch from 'node-fetch';
import q from 'q';

export function resolved(value) {
  const { resolve, promise } = q.defer();
  resolve(value);
  return promise;
}

export function rejected(value) {
  const { reject, promise } = q.defer();
  reject(value);
  return promise;
}

export function fetchJSON(url) {
  return fetch(url)
  .then((res) => res.json())
  .then((res) => {
    if(res.error) throw res.error;
    else return res;
  });
}

export function buildXML(obj) {
  const builder = new xml2js.Builder();

  try { return resolved(builder.buildObject(obj)); }
  catch(err) { return rejected(err); }
}

export function formatTime(totalSeconds) {
  const sec_num = parseInt(totalSeconds, 10);
  
  let hours   = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) { hours   = "0"+hours; }
  if (minutes < 10) { minutes = "0"+minutes; }
  if (seconds < 10) { seconds = "0"+seconds; }

  return `${hours}:${minutes}:${seconds}`;
}

export function formatDate(date) {
  return moment(date).format('ddd, D MMM YYYY hh:mm:ss ZZ');
}

export function parseYoutubeDuration(str) {
  const reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  let hours = 0, minutes = 0, seconds = 0, totalSeconds;

  if (reptms.test(str))
  {
    const matches = reptms.exec(str);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
    totalSeconds = hours * 3600  + minutes * 60 + seconds;
  }

  return totalSeconds;
}

export function removeUnsafeCharsAndEmojis(unsafeStringWithEmoji) {
  const unsafeCharMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  const emojiRanges = [
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]'
  ];

  const safeStringWithEmoji = String(unsafeStringWithEmoji).replace(/[&<>"'\/]/g, (s) => unsafeCharMap[s]);
  const safeStringWithoutEmoji = safeStringWithEmoji.replace(new RegExp(emojiRanges.join('|'), 'g'), '');

  return safeStringWithoutEmoji;
}