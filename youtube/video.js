import Q from 'q';
import Youtube from './api.js';

export default class Video
{
	constructor(id)
	{
		this.videoId = id;
	}
	getDownloadURL()
	{
		return Youtube.getVideoDownloadURL(this.videoId);
	}
}