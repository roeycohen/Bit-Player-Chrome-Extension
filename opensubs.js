//the original opensubtitles lib works only on regular files
function copyBuffer(e)
{
	var t = new Buffer(e.length);
	e.copy(t);
	return t;
}
function getStreamBuffer(e)
{
	return new Promise(function (resolve, reject)
	{
		var r = [], o = 0;
		e.on("data", function (data)
		{
			r.push(copyBuffer(data));
			o += data.length;
		});
		e.on("end", function ()
		{
			e.destroy();
			resolve(buffer.Buffer.concat(r, o))
		});
		e.on("error", reject);
	})
}
function computeFileHash(e)
{
	var stream_start = e.createReadStream({start: 0, end: 65535});
	var steam_end = e.createReadStream({start: e.length - 65536, end: e.length - 1});

	return Promise.all([getStreamBuffer(stream_start), getStreamBuffer(steam_end)]).then(function (t)
	{
		return computeHash(e.length, t[0], t[1])
	})
}

// ============================================================================

//see: https://github.com/ka2er/node-opensubtitles-api/blob/master/lib/opensubtitles.js, checksumReady method.
//this implementation is so much more elegant than the original at opensubtitles
function computeHash(stream_length, start_section, end_section)
{
	function sumHex64bits(n1, n2)
	{
		for (var n = 0; n < n2.length; n += 8)
			n1 = n1.add(Long.fromString(Array.prototype.reverse.call(n2.slice(n, n + 8)).toString("hex"), true, 16));
		return n1;
	}

	var o = Long.fromString(stream_length.toString(), true);
	o = sumHex64bits(o, start_section);
	o = sumHex64bits(o, end_section);
	return ("0000000000000000" + o.toString(16)).substr(-16);
}

function get_lang_ids()
{
	return new Promise(function (resolve, reject)
	{
		os.api.GetSubLanguages(function (n, r)
		{
			n ? reject(n) : resolve(r.data)
		});
	})
}
function get_opensubtitles(e, t)
{
	t = t || {};
	var n = t && t.lang || "pol";
	return new Promise(function (resolve, reject)
	{
		function u(t, u)
		{
			if (t)
				return reject(t);

			var i = u.token;
			computeFileHash(e).then(function (t)
			{
				console.log("searching subtitles, hash: ", t);
				os.api.SearchSubtitles(function (u, a)
				{
					if (u)
						return reject(u);

					var s = a.data && a.data.filter(function (e)
						{
							return "srt" == e.SubFormat
						});
					return s && s.length ? void os.api.DownloadSubtitles(function (e, t)
					{
						if (e)
							return reject(e);

						gzipped_subs = new Buffer(t.data[0].data, "base64");
						var u = new stream.Readable;
						u.push(gzipped_subs), u.push(null);
						var i = u.pipe(zlib.createGunzip()), a = [], s = 0;
						i.on("data", function (e)
						{
							a.push(e), s += e.length
						}), i.on("end", function ()
						{
							var e = Buffer.concat(a, s), t = e.toString();
							if ("pol" == n && t.indexOf("�") >= 0)
							{
								var o = encoding.convert(e, "utf8", "cp1250").toString();
								o.indexOf("�") < 0 && (t = o)
							}
							resolve(t)
						}), i.on("error", reject)
					}, i, [s[0].IDSubtitleFile]) : reject({token: i, moviehash: t, subfilename: e})
				}, i, [{moviehash: t, sublanguageid: n}]);
			}, reject);
		}

		return t.subtitles ? resolve(t.subtitles) : (console.log("logging in to opensubtitles"), void os.api.LogIn(u, "", "", "pol", os.ua))
	})
}
var OS = require("opensubtitles");
zlib = require("zlib");
buffer = require("buffer");
stream = require("stream");
path = require("path");
encoding = require("encoding");
Long = require("long");
os = new OS;
module.exports.get_opensubtitles = get_opensubtitles;
module.exports.get_lang_ids = get_lang_ids;
