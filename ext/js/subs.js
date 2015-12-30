;
//see: https://www.npmjs.com/package/opensubtitles
//[{"MatchedBy":"moviehash","IDSubMovieFile":"12900881","MovieHash":"2476dfc7cc376dd0","MovieByteSize":"130751619","MovieTimeMS":"0","IDSubtitleFile":"1954952199","SubFileName":"the.big.bang.theory.907.hdtv.repack-lol-heb.srt","SubActualCD":"1","SubSize":"35428","SubHash":"365f806e62e155f90c7b4c4c6c44ed77","SubLastTS":"00:18:23","IDSubtitle":"6370906","UserID":"0","SubLanguageID":"heb","SubFormat":"srt","SubSumCD":"1","SubAuthorComment":"","SubAddDate":"2015-11-07 06:42:37","SubBad":"1","SubRating":"1.0","SubDownloadsCnt":"4702","MovieReleaseName":" the.big.bang.theory.907.hdtv.repack-lol","MovieFPS":"25.000","IDMovie":"382489","IDMovieImdb":"5073156","MovieName":"\"The Big Bang Theory\" The Spock Resonance","MovieNameEng":"","MovieYear":"2015","MovieImdbRating":"8.3","SubFeatured":"0","UserNickName":"","ISO639":"he","LanguageName":"Hebrew","SubComments":"1","SubHearingImpaired":"0","UserRank":"","SeriesSeason":"9","SeriesEpisode":"7","MovieKind":"episode","SubHD":"1","SeriesIMDBParent":"898266","SubEncoding":"UTF-8","SubDownloadLink":"http://dl.opensubtitles.org/en/download/file/src-api/vrf-19d70c5f/sid-ovfnue73tmttg0hsarpq2c8ui6/1954952199.gz","ZipDownloadLink":"http://dl.opensubtitles.org/en/download/sub/src-api/vrf-f5490bb8/sid-ovfnue73tmttg0hsarpq2c8ui6/6370906","SubtitlesLink":"http://www.opensubtitles.org/en/subtitles/6370906/sid-ovfnue73tmttg0hsarpq2c8ui6/the-big-bang-theory-the-spock-resonance-he"},{"MatchedBy":"moviehash","IDSubMovieFile":"12909231","MovieHash":"2476dfc7cc376dd0","MovieByteSize":"130751619","MovieTimeMS":"0","IDSubtitleFile":"1954495642","SubFileName":"The.Big.Bang.Theory.S08E10.Heb.srt","SubActualCD":"1","SubSize":"26605","SubHash":"ce5d6da9d5b94e2ed0efb966dcc8faa3","SubLastTS":"00:19:04","IDSubtitle":"5917132","UserID":"0","SubLanguageID":"heb","SubFormat":"srt","SubSumCD":"1","SubAuthorComment":"","SubAddDate":"2014-12-04 17:11:21","SubBad":"0","SubRating":"0.0","SubDownloadsCnt":"11562","MovieReleaseName":" The.Big.Bang.Theory.S08E10","MovieFPS":"0.000","IDMovie":"186019","IDMovieImdb":"3823250","MovieName":"\"The Big Bang Theory\" The Champagne Reflection","MovieNameEng":"","MovieYear":"2014","MovieImdbRating":"6.7","SubFeatured":"0","UserNickName":"","ISO639":"he","LanguageName":"Hebrew","SubComments":"0","SubHearingImpaired":"0","UserRank":"","SeriesSeason":"8","SeriesEpisode":"10","MovieKind":"episode","SubHD":"0","SeriesIMDBParent":"898266","SubEncoding":"CP1255","SubDownloadLink":"http://dl.opensubtitles.org/en/download/file/src-api/vrf-19d70c5a/sid-ovfnue73tmttg0hsarpq2c8ui6/1954495642.gz","ZipDownloadLink":"http://dl.opensubtitles.org/en/download/sub/src-api/vrf-f54e0bb5/sid-ovfnue73tmttg0hsarpq2c8ui6/5917132","SubtitlesLink":"http://www.opensubtitles.org/en/subtitles/5917132/sid-ovfnue73tmttg0hsarpq2c8ui6/the-big-bang-theory-the-champagne-reflection-he"},{"MatchedBy":"moviehash","IDSubMovieFile":"12937582","MovieHash":"2476dfc7cc376dd0","MovieByteSize":"130751619","MovieTimeMS":"0","IDSubtitleFile":"1954960712","SubFileName":"The.Big.Bang.Theory.S09E07.720p.HDTV.X264-DIMENSION-heb.srt","SubActualCD":"1","SubSize":"19742","SubHash":"0073f137a7bc7d5a93cff2a8514e03c5","SubLastTS":"00:18:11","IDSubtitle":"6379218","UserID":"0","SubLanguageID":"heb","SubFormat":"srt","SubSumCD":"1","SubAuthorComment":"","SubAddDate":"2015-11-12 23:51:19","SubBad":"0","SubRating":"0.0","SubDownloadsCnt":"599","MovieReleaseName":" The.Big.Bang.Theory.S09E07.720p.HDTV.X264-DIMENSION","MovieFPS":"0.000","IDMovie":"382490","IDMovieImdb":"5090816","MovieName":"\"The Big Bang Theory\" The Helium Insufficiency","MovieNameEng":"","MovieYear":"2015","MovieImdbRating":"7.3","SubFeatured":"0","UserNickName":"","ISO639":"he","LanguageName":"Hebrew","SubComments":"0","SubHearingImpaired":"0","UserRank":"","SeriesSeason":"9","SeriesEpisode":"6","MovieKind":"episode","SubHD":"1","SeriesIMDBParent":"898266","SubEncoding":"CP1255","SubDownloadLink":"http://dl.opensubtitles.org/en/download/file/src-api/vrf-19cf0c55/sid-ovfnue73tmttg0hsarpq2c8ui6/1954960712.gz","ZipDownloadLink":"http://dl.opensubtitles.org/en/download/sub/src-api/vrf-f55c0bbd/sid-ovfnue73tmttg0hsarpq2c8ui6/6379218","SubtitlesLink":"http://www.opensubtitles.org/en/subtitles/6379218/sid-ovfnue73tmttg0hsarpq2c8ui6/the-big-bang-theory-the-helium-insufficiency-he"}]

var buffer = torrent.buffer;
var Long = torrent.long;
var stream = torrent.stream;
var zlib = torrent.zlib;

var subs = {

	//the original opensubtitles lib works only on regular files
	copyBuffer: function (e)
	{
		var t = new buffer.Buffer(e.length);
		e.copy(t);
		return t;
	},
	getStreamBuffer: function (e)
	{
		return new Promise(function (resolve, reject)
		{
			var r = [], o = 0;
			e.on("data", function (data)
			{
				r.push(subs.copyBuffer(data));
				o += data.length;
			});
			e.on("end", function ()
			{
				e.destroy();
				resolve(buffer.Buffer.concat(r, o))
			});
			e.on("error", reject);
		})
	},
	computeFileHash: function (e)
	{
		var stream_start = e.createReadStream({start: 0, end: 65535});
		var steam_end = e.createReadStream({start: e.length - 65536, end: e.length - 1});

		return Promise.all([subs.getStreamBuffer(stream_start), subs.getStreamBuffer(steam_end)]).then(function (t)
		{
			return subs.computeHash(e.length, t[0], t[1])
		})
	},

	// ============================================================================

	//see: https://github.com/ka2er/node-opensubtitles-api/blob/master/lib/opensubtitles.js, checksumReady method.
	//this implementation is so much more elegant than the original at opensubtitles
	computeHash: function (stream_length, start_section, end_section)
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
	},

	os_auth: function ()
	{
		return new Promise(function (resolve, reject)
		{
			os.api.LogIn(function (err, data)
			{
				if (err)
					return reject(err);

				resolve(data.token);
			}, "emrk", "qwerty", "pol", os.ua);
		});
	},

	os_available_subs: function (auth_token, torrent_file, lng)
	{
		return new Promise(function (resolve, reject)
		{
			subs.computeFileHash(torrent_file).then(function (hash)
			{
				os.api.SearchSubtitles(function (err, data)
				{
					if (err)
						return reject(err);

					var srts = data.data && data.data.filter(function (e)
						{
							return "srt" == e.SubFormat
						});

					resolve(srts);
				}, auth_token, [{moviehash: hash, sublanguageid: lng}]);
			}, reject);
		});
	},

	os_download_sub: function (auth_token, sub_files_ids)
	{
		return new Promise(function (resolve, reject)
		{
			os.api.DownloadSubtitles(function (err, data)
			{
				if (err)
					return reject(err);

				console.log('DownloadSubtitles', data);

				subs.extract_gzip(data.data[0].data).then(function(srt)
				{
					resolve(srt);
				}, reject);

			}, auth_token, sub_files_ids);
		});
	},

	extract_gzip: function(subfile_zip)
	{
		return new Promise(function (resolve, reject)
		{
			var gzipped_subs = new buffer.Buffer(subfile_zip, "base64");
			var u = new stream.Readable;
			u.push(gzipped_subs);
			u.push(null);
			var i = u.pipe(zlib.createGunzip());
			var output_sections = [];
			var output_length = 0;
			i.on("data", function (e)
			{
				output_sections.push(e);
				output_length += e.length;
				console.log(output_length);
			});
			i.on("end", function ()
			{
				var output = buffer.Buffer.concat(output_sections, output_length);
				var t = output.toString();
				//if ("pol" == lng && t.indexOf("�") >= 0)
				//{
				//	var o = encoding.convert(output, "utf8", "cp1250").toString();
				//	if (o.indexOf("�") < 0)
				//		t = o;
				//}
				resolve(t);
			});
			i.on("error", reject);
		});
	},

	// cached results for torrent.opensubs.get_lang_ids()
	lang_ids: [
		{"SubLanguageID": "afr", "LanguageName": "Afrikaans", "ISO639": "af"},
		{"SubLanguageID": "alb", "LanguageName": "Albanian", "ISO639": "sq"},
		{"SubLanguageID": "ara", "LanguageName": "Arabic", "ISO639": "ar"},
		{"SubLanguageID": "arm", "LanguageName": "Armenian", "ISO639": "hy"},
		{"SubLanguageID": "baq", "LanguageName": "Basque", "ISO639": "eu"},
		{"SubLanguageID": "bel", "LanguageName": "Belarusian", "ISO639": "be"},
		{"SubLanguageID": "ben", "LanguageName": "Bengali", "ISO639": "bn"},
		{"SubLanguageID": "bos", "LanguageName": "Bosnian", "ISO639": "bs"},
		{"SubLanguageID": "bre", "LanguageName": "Breton", "ISO639": "br"},
		{"SubLanguageID": "bul", "LanguageName": "Bulgarian", "ISO639": "bg"},
		{"SubLanguageID": "bur", "LanguageName": "Burmese", "ISO639": "my"},
		{"SubLanguageID": "cat", "LanguageName": "Catalan", "ISO639": "ca"},
		{"SubLanguageID": "chi", "LanguageName": "Chinese (simplified)", "ISO639": "zh"},
		{"SubLanguageID": "zht", "LanguageName": "Chinese (traditional)", "ISO639": "zt"},
		{"SubLanguageID": "zhe", "LanguageName": "Chinese bilingual", "ISO639": "ze"},
		{"SubLanguageID": "hrv", "LanguageName": "Croatian", "ISO639": "hr"},
		{"SubLanguageID": "cze", "LanguageName": "Czech", "ISO639": "cs"},
		{"SubLanguageID": "dan", "LanguageName": "Danish", "ISO639": "da"},
		{"SubLanguageID": "dut", "LanguageName": "Dutch", "ISO639": "nl"},
		{"SubLanguageID": "eng", "LanguageName": "English", "ISO639": "en"},
		{"SubLanguageID": "epo", "LanguageName": "Esperanto", "ISO639": "eo"},
		{"SubLanguageID": "est", "LanguageName": "Estonian", "ISO639": "et"},
		{"SubLanguageID": "fin", "LanguageName": "Finnish", "ISO639": "fi"},
		{"SubLanguageID": "fre", "LanguageName": "French", "ISO639": "fr"},
		{"SubLanguageID": "glg", "LanguageName": "Galician", "ISO639": "gl"},
		{"SubLanguageID": "geo", "LanguageName": "Georgian", "ISO639": "ka"},
		{"SubLanguageID": "ger", "LanguageName": "German", "ISO639": "de"},
		{"SubLanguageID": "ell", "LanguageName": "Greek", "ISO639": "el"},
		{"SubLanguageID": "heb", "LanguageName": "Hebrew", "ISO639": "he"},
		{"SubLanguageID": "hin", "LanguageName": "Hindi", "ISO639": "hi"},
		{"SubLanguageID": "hun", "LanguageName": "Hungarian", "ISO639": "hu"},
		{"SubLanguageID": "ice", "LanguageName": "Icelandic", "ISO639": "is"},
		{"SubLanguageID": "ind", "LanguageName": "Indonesian", "ISO639": "id"},
		{"SubLanguageID": "ita", "LanguageName": "Italian", "ISO639": "it"},
		{"SubLanguageID": "jpn", "LanguageName": "Japanese", "ISO639": "ja"},
		{"SubLanguageID": "kaz", "LanguageName": "Kazakh", "ISO639": "kk"},
		{"SubLanguageID": "khm", "LanguageName": "Khmer", "ISO639": "km"},
		{"SubLanguageID": "kor", "LanguageName": "Korean", "ISO639": "ko"},
		{"SubLanguageID": "lav", "LanguageName": "Latvian", "ISO639": "lv"},
		{"SubLanguageID": "lit", "LanguageName": "Lithuanian", "ISO639": "lt"},
		{"SubLanguageID": "ltz", "LanguageName": "Luxembourgish", "ISO639": "lb"},
		{"SubLanguageID": "mac", "LanguageName": "Macedonian", "ISO639": "mk"},
		{"SubLanguageID": "may", "LanguageName": "Malay", "ISO639": "ms"},
		{"SubLanguageID": "mal", "LanguageName": "Malayalam", "ISO639": "ml"},
		{"SubLanguageID": "mni", "LanguageName": "Manipuri", "ISO639": "ma"},
		{"SubLanguageID": "mon", "LanguageName": "Mongolian", "ISO639": "mn"},
		{"SubLanguageID": "mne", "LanguageName": "Montenegrin", "ISO639": "me"},
		{"SubLanguageID": "nor", "LanguageName": "Norwegian", "ISO639": "no"},
		{"SubLanguageID": "oci", "LanguageName": "Occitan", "ISO639": "oc"},
		{"SubLanguageID": "per", "LanguageName": "Persian", "ISO639": "fa"},
		{"SubLanguageID": "pol", "LanguageName": "Polish", "ISO639": "pl"},
		{"SubLanguageID": "por", "LanguageName": "Portuguese", "ISO639": "pt"},
		{"SubLanguageID": "pob", "LanguageName": "Portuguese (BR)", "ISO639": "pb"},
		{"SubLanguageID": "rum", "LanguageName": "Romanian", "ISO639": "ro"},
		{"SubLanguageID": "rus", "LanguageName": "Russian", "ISO639": "ru"},
		{"SubLanguageID": "scc", "LanguageName": "Serbian", "ISO639": "sr"},
		{"SubLanguageID": "sin", "LanguageName": "Sinhalese", "ISO639": "si"},
		{"SubLanguageID": "slo", "LanguageName": "Slovak", "ISO639": "sk"},
		{"SubLanguageID": "slv", "LanguageName": "Slovenian", "ISO639": "sl"},
		{"SubLanguageID": "spa", "LanguageName": "Spanish", "ISO639": "es"},
		{"SubLanguageID": "swa", "LanguageName": "Swahili", "ISO639": "sw"},
		{"SubLanguageID": "swe", "LanguageName": "Swedish", "ISO639": "sv"},
		{"SubLanguageID": "syr", "LanguageName": "Syriac", "ISO639": "sy"},
		{"SubLanguageID": "tgl", "LanguageName": "Tagalog", "ISO639": "tl"},
		{"SubLanguageID": "tam", "LanguageName": "Tamil", "ISO639": "ta"},
		{"SubLanguageID": "tel", "LanguageName": "Telugu", "ISO639": "te"},
		{"SubLanguageID": "tha", "LanguageName": "Thai", "ISO639": "th"},
		{"SubLanguageID": "tur", "LanguageName": "Turkish", "ISO639": "tr"},
		{"SubLanguageID": "ukr", "LanguageName": "Ukrainian", "ISO639": "uk"},
		{"SubLanguageID": "urd", "LanguageName": "Urdu", "ISO639": "ur"},
		{"SubLanguageID": "vie", "LanguageName": "Vietnamese", "ISO639": "vi"}
	]
};