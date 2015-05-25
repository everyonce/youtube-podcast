var config = {
	base_url: process.env.base_url || 'missing_base_url',
	base_path: process.env.base_path || 'missing_path',
	youtube_api_key: process.env.youtube_api_key || 'missing_key',
	port: process.env.PORT || 3000
};
exports.config = config;
