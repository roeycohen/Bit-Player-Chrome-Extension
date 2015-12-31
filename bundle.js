process.hrtime = require('browser-process-hrtime');
window.torrent = {
	TorrentStream: require("torrent-stream"),
	MemoryStorage: require("torrent-memory-storage"),
	opensubtitles: require("opensubtitles"),
	//zlib: require("zlib"),
	buffer: require("buffer"),
	stream: require("stream"),
	path: require("path"),
	//encoding: require("encoding"),
	Long: require("long")
};
window.os = new window.torrent.opensubtitles();