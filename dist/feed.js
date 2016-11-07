"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _helpers = require("./helpers.js");

function build(info, videos, urlBuilder) {
  var escapedTitle = (0, _helpers.removeUnsafeCharsAndEmojis)(info.title);
  var escapedAuthor = escapedTitle;
  var escapedDescription = (0, _helpers.removeUnsafeCharsAndEmojis)(info.description);

  var rss = {
    "$": {
      "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
      "version": "2.0",
      "xmlns:atom": "http://www.w3.org/2005/Atom"
    },
    "channel": [{
      "atom:link": [{
        "$": {
          "rel": "self",
          "type": "application/rss+xml",
          "href": info.site
        }
      }],
      "lastBuildDate": [info.publishedAt],
      "title": [escapedTitle],
      "itunes:author": [escapedTitle],
      "link": [info.site],
      "description": [escapedDescription],
      "itunes:subtitle": [escapedDescription.substr(0, 100) + '...'],
      "itunes:summary": [escapedDescription],
      "language": ["en"],
      "itunes:owner": [{
        "itunes:name": [escapedTitle],
        "itunes:email": ['n@n.n']
      }],
      "image": [{
        "url": [info.thumbnail],
        "title": [escapedTitle],
        "link": [info.site]
      }],
      "itunes:image": [{ "$": { "href": info.thumbnail } }],
      "category": ["TV & Film", "Podcasting"],
      "itunes:category": [{
        "$": { "text": "TV & Film" }
      }, {
        "$": { "text": "Technology" },
        "itunes:category": [{ "$": { "text": "Podcasting" } }]
      }],
      "itunes:explicit": ["no"],
      "item": []
    }]
  };

  rss.channel[0].item = videos.map(function (video) {
    var escapedTitle = (0, _helpers.removeUnsafeCharsAndEmojis)(video.title);
    var escapedDescription = (0, _helpers.removeUnsafeCharsAndEmojis)(video.description);

    return {
      "title": [escapedTitle],
      "itunes:author": [escapedAuthor],
      "description": [escapedDescription],
      "itunes:subtitle": [escapedDescription.substr(0, 100) + '...'],
      "itunes:summary": [''],
      "enclosure": [{
        "$": {
          "url": urlBuilder(video.id),
          "type": video.type,
          "length": video.length
        }
      }],
      "guid": [urlBuilder(video.id)],
      "pubDate": [video.publishedAt],
      "category": ["TV & Film"],
      "itunes:explicit": ["no"],
      "itunes:duration": [video.duration],
      "itunes:keywords": ['YouTube']
    };
  });

  return (0, _helpers.buildXML)({ rss: rss });
}