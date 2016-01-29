;
//based on: https://github.com/feross/webtorrent/blob/1f3a4153b6e8d07b5637376b509c424528809899/lib/server.js
var http = {
	server: null,
	file: null,
	start: function (port)
	{
		if (undefined === port)
			port = 5000;

		//console.log(torrent);
		http.server = torrent.http.createServer(http.request);

		http.server.on("connection", function (socket)
		{
			socket.setTimeout(36000000)
		});

		http.server.on("error", function (e)
		{
			if (0 < e.message.indexOf('failed to listen'))
			{
				console.log('port ' + port + ' was already in use, using random port.');
				http.server.close();
				http.start(0);
			}
		});

		http.server.listen(port, function ()
		{
			console.log("http://localhost:" + http.server.address().port);
		});
	},
	request: function (req, res)
	{
		// Allow CORS requests to specify arbitrary headers, e.g. 'Range',
		// by responding to the OPTIONS preflight request with the specified
		// origin and requested headers.
		if (req.method === 'OPTIONS' && req.headers['access-control-request-headers'])
		{
			res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
			res.setHeader('Access-Control-Max-Age', '1728000');
			return res.end();
		}

		if (req.headers.origin)
		{
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		}

		var parser = document.createElement('a');
		parser.href = req.url;
		var pathname = parser.pathname;
		//console.log(pathname);

		if (pathname === '/favicon.ico') return res.end();

		if ("/" === pathname)
		{
			res.setHeader("Content-Type", "text/html");
			return res.end("<h1>Bit-Player</h1>");
		}

		/*
		 var s = /\/(subtitles\/)?(\d+)/.exec(pathname);
		 var s = /\/(subtitles\/)?(\d+)/.exec(pathname);
		 var a = s && Number(s[2]);
		 if (!s || a >= e.files.length)
		 {
		 res.statusCode = 404;
		 return res.end('404 Not Found');
		 }

		 var file = e.files[a];
		 if (s[1])
		 {
		 if (file.subtitles)
		 {
		 subtitles = "WEBVTT\n" + file.subtitles.replace(/(\d\d:\d\d)\,(\d\d\d)/g, "$1.$2");
		 res.setHeader("Content-Type", "text/vtt");
		 res.end(subtitles);
		 }
		 else
		 {
		 res.statusCode = 404;
		 res.end()
		 }
		 return;
		 }
		 */

		var file = http.file;
		if (!file)
		{
			res.statusCode = 404;
			return res.end()
		}

		if (file instanceof File)
			file.length = file.size;

		//res.setHeader("Content-Disposition", "attachment");
		res.setHeader('Accept-Ranges', 'bytes');
		res.setHeader('Content-Type', torrent.mime.lookup(file.name));
		res.statusCode = 200;
		// Support DLNA streaming
		res.setHeader('transferMode.dlna.org', 'Streaming');
		res.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000');

		var range = null;
		if (req.headers.range)
		{
			res.statusCode = 206;
			range = torrent.rangeParser(file.length, req.headers.range)[0];
			res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + file.length);
			res.setHeader("Content-Length", range.end - range.start + 1);
		}
		else
		{
			res.setHeader("Content-Length", file.length);
		}

		if ("HEAD" === req.method)
			return res.end();

		if (file instanceof File)
		{
			if (range)
				file = file.slice(range.start, range.end + 1);

			bundle2.filereaderStream(file).pipe(res);
		}
		else
		{
			var ts = file.createReadStream(range);
			res.on("close", function ()
			{
				ts.destroy();
			});
			ts.pipe(res);
		}
	}
};