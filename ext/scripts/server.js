function CopyStream(e)
{
	stream.Transform.call(this, e)
}
var debug = require("debug")("webtorrent:server"), http = require("http"), mime = require("mime"), pump = require("pump"), rangeParser = require("range-parser"), url = require("url"), stream = require("stream"), util = require("util");
CopyStream.prototype._transform = function (e, t, r)
{
	this.push(e), r()
}, util.inherits(CopyStream, stream.Transform), module.exports = function (e)
{
	var t = http.createServer();
	return t.on("connection", function (e)
	{
		e.setTimeout(36e6)
	}), t.on("request", function (t, r)
	{
		if (debug(t.method, t.url), "OPTIONS" === t.method && t.headers["access-control-request-headers"])return r.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS"), r.setHeader("Access-Control-Allow-Headers", t.headers["access-control-request-headers"]), r.setHeader("Access-Control-Max-Age", "1728000"), r.end();
		t.headers.origin && r.setHeader("Access-Control-Allow-Origin", t.headers.origin);
		var n = url.parse(t.url).pathname;
		if ("/favicon.ico" === n)return r.end();
		if ("/" === n)return r.setHeader("Content-Type", "text/html"), r.end("<h1>WebTorrent</h1><ol>" + e.files.map(function (e, t)
			{
				return '<li><a href="/' + t + '">' + e.name + "</a></li>"
			}).join("<br>") + "</ol>");
		var s = /\/(subtitles\/)?(\d+)/.exec(n), a = s && Number(s[2]);
		if (!s || a >= e.files.length)return r.statusCode = 404, r.end();
		var o = e.files[a];
		if (s[1])return o.subtitles ? (subtitles = "WEBVTT\n" + o.subtitles.replace(/(\d\d:\d\d)\,(\d\d\d)/g, "$1.$2"), r.setHeader("Content-Type", "text/vtt"), r.end(subtitles)) : (r.statusCode = 404, r.end());
		r.setHeader("Accept-Ranges", "bytes"), r.setHeader("Content-Type", mime.lookup(o.name)), r.statusCode = 200, r.setHeader("transferMode.dlna.org", "Streaming"), r.setHeader("contentFeatures.dlna.org", "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000");
		var d;
		if (t.headers.range ? (r.statusCode = 206, d = rangeParser(o.length, t.headers.range)[0], debug("range %s", JSON.stringify(d)), r.setHeader("Content-Range", "bytes " + d.start + "-" + d.end + "/" + o.length), r.setHeader("Content-Length", d.end - d.start + 1)) : r.setHeader("Content-Length", o.length), console.log(t.method, n, d), "HEAD" === t.method)return r.end();
		var i = o.createReadStream(d);
		r.on("close", function ()
		{
			console.log("close", t.method, n, d), i.destroy()
		}), i.pipe(r)
	}), t
};