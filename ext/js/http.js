;
var http = {
	server: null,
	start: function ()
	{
		http.server = http.createServer();
		console.log("http://localhost:" + http.server.address().port);
		t.on("connection", function (e)
		{
			e.setTimeout(36e6)
		});
		t.on("request", http.request);
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

		if (request.headers.origin)
			response.setHeader("Access-Control-Allow-Origin", request.headers.origin);

		var n = url.parse(request.url).pathname;

		if ("/favicon.ico" === n)
			return response.end();

		if ("/" === n)
		{
			response.setHeader("Content-Type", "text/html");
			response.end("<h1>WebTorrent</h1><ol>" + e.files.map(function (e, t)
				{
					return '<li><a href="/' + t + '">' + e.name + "</a></li>"
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

		response.setHeader("Accept-Ranges", "bytes");
		response.setHeader("Content-Type", mime.lookup(o.name));
		response.statusCode = 200;
		response.setHeader("transferMode.dlna.org", "Streaming");
		response.setHeader("contentFeatures.dlna.org", "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000");

		var d;
		if (request.headers.range)
		{
			response.statusCode = 206;
			d = rangeParser(o.length, request.headers.range)[0];
			response.setHeader("Content-Range", "bytes " + d.start + "-" + d.end + "/" + o.length);
			response.setHeader("Content-Length", d.end - d.start + 1);
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

		var i = o.createReadStream(d);
		response.on("close", function ()
		{
			i.destroy();
		});
		i.pipe(response);
	}
};