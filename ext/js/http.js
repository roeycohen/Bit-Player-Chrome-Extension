;
var http = {
	server: null,
	start: function ()
	{
		//console.log(torrent);
		http.server = torrent.http.createServer();

		http.server.on("connection", function (e)
		{
			e.setTimeout(36e6)
		});

		http.server.on("request", http.request);

		http.server.listen(5001, function ()
		{
			console.log("http://localhost:" + http.server.address().port);
		});
	},
	request: function (request, response)
	{
		console.log('request', request);

		if ("OPTIONS" === request.method && request.headers["access-control-request-headers"])
		{
			response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
			response.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"]);
			response.setHeader("Access-Control-Max-Age", "1728000");
			response.end();
			return;
		}

		var parser = document.createElement('a');
		parser.href = request.url;
		var n = parser.pathname;
		console.log(n);

		response.statusCode = 200;
		response.end('hello');
		return;

		if (request.headers.origin)
			response.setHeader("Access-Control-Allow-Origin", request.headers.origin);

		if ("/favicon.ico" === n)
			return response.end();

		if ("/" === n)
		{
			response.setHeader("Content-Type", "text/html");
			response.end("<h1>WebTorrent</h1><ol>" + e.files.map(function (file, index)
				{
					return '<li><a href="/' + index + '">' + file.name + "</a></li>"
				}).join("<br>") + "</ol>");
			return;
		}

		var s = /\/(subtitles\/)?(\d+)/.exec(n);
		var a = s && Number(s[2]);
		if (!s || a >= e.files.length)
		{
			response.statusCode = 404;
			response.end();
			return;
		}

		var o = e.files[a];
		if (s[1])
		{
			if (o.subtitles)
			{
				subtitles = "WEBVTT\n" + o.subtitles.replace(/(\d\d:\d\d)\,(\d\d\d)/g, "$1.$2");
				response.setHeader("Content-Type", "text/vtt");
				response.end(subtitles);
			}
			else
			{
				response.statusCode = 404;
				response.end()
			}
			return;
		}

		response.statusCode = 200;
		response.setHeader("Content-Disposition", "attachment");
		response.setHeader("Accept-Ranges", "bytes");
		response.setHeader("Content-Type", torrent.mime.lookup(o.name));
		response.setHeader("transferMode.dlna.org", "Streaming");
		response.setHeader("contentFeatures.dlna.org", "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000");

		var range;
		if (request.headers.range)
		{
			response.statusCode = 206;
			range = torrent.rangeParser(o.length, request.headers.range)[0];
			response.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + o.length);
			response.setHeader("Content-Length", range.end - range.start + 1);
		}
		else
		{
			response.setHeader("Content-Length", o.length);
		}

		if ("HEAD" === request.method)
		{
			response.end();
			return;
		}

		var i = o.createReadStream(range);
		response.on("close", function ()
		{
			i.destroy();
		});
		i.pipe(response);
	}
};