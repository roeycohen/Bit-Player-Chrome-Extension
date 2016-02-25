process.hrtime = require('browser-process-hrtime');
window.localStorage = chrome.storage.local;
fs = require('fs');
fs.existsSync = function(path)
{
	console.log('existsSync', path);
	return true;
};
var torrents = require('torrent-stream');

//var mem = require('torrent-memory-storage');

var test_torrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

var engine = torrents(test_torrent, {
	//storage: mem
});
console.log('engine', engine);
engine.on('ready', function ()
{
	console.log('engine ready', engine);
	engine.files.forEach(function (file)
	{
		console.log('filename:', file.name);
	});
});
