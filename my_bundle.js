//in node_modules\torrent-stream\node_modules\torrent-discovery\package.json remove these 3 lines:
//"browser": {
//	"bittorrent-dht/client": false
//},
//then run: npm run my_bundle

if (typeof window !== 'undefined')
{
	process.hrtime = require('browser-process-hrtime');
	window.localStorage = chrome.storage.local;
	fs = require('fs');
	fs.existsSync = function(path)
	{
		console.log('existsSync', path);
		return true;
	};
}

var torrents = require('torrent-stream');
var mem = require('memory-chunk-store');

var test_torrent = 'magnet:?xt=urn:btih:b662dbf7f84740b9fa1a332ce42c3f2859727134&dn=Marvels.Jessica.Jones.S01E05.WEBRip.XviD-FUM%5Bettv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

var engine = torrents(test_torrent, {
	storage: mem
});

engine.on('ready', function ()
{
	engine.files.forEach(function (file)
	{
		if (file.name === 'Torrent-Downloaded-from-ExtraTorrent.cc.txt')
		{
			console.log('filename:', file.name);
			var stream = file.createReadStream();

			stream.on("data", function (chunk)
			{
				console.log('got %d bytes of data', chunk.length, chunk);
			});
			stream.on("close", function ()
			{
				console.log("close");
				//stream.destroy();
			});
			stream.on("end", function ()
			{
				console.log("end");
				stream.destroy();
			});

			//stream.pipe(process.stdout);
		}
	});
});
