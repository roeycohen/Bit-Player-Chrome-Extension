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

	window.my_bundle = {
		torrents: require('torrent-stream'),
		mem: require('memory-chunk-store')
	}
}
else
{
	var torrents = require('torrent-stream');
	var mem = require('memory-chunk-store');

	var test_torrent = 'magnet:?xt=urn:btih:UXSMUUXKIQKZEVFOZ7J6GAMUDMTW3VLO&dn=Tarzan+(1999)+720p+BrRip+x264+YIFY&tr=udp://tracker.openbittorrent.com:80/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.blackunicorn.xyz:6969/announce&tr=udp://glotorrents.pw:6969/announce';

	var engine = torrents(test_torrent, {
		verify: false,
		storage: mem,
		connections: 100,
		uploads: 10,
		dht: true,
		tracker: true
	});

	engine.on('ready', function ()
	{
		console.log('ready');
		engine.files.forEach(function (file)
		{
			console.log('filename:', file.name);
			if (file.name === 'Tarzan.1999.720p.BrRip.x264.YIFY.srt')
			{

				var stream = file.createReadStream();

				stream.on("data", function (chunk)
				{
					console.log('got %d bytes of data', chunk.length, chunk);
				});
				stream.on("close", function ()
				{
					console.log("close");
					stream.destroy();
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
}
