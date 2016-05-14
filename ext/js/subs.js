;
//see: https://www.npmjs.com/package/opensubtitles
//[{"MatchedBy":"moviehash","IDSubMovieFile":"12900881","MovieHash":"2476dfc7cc376dd0","MovieByteSize":"130751619","MovieTimeMS":"0","IDSubtitleFile":"1954952199","SubFileName":"the.big.bang.theory.907.hdtv.repack-lol-heb.srt","SubActualCD":"1","SubSize":"35428","SubHash":"365f806e62e155f90c7b4c4c6c44ed77","SubLastTS":"00:18:23","IDSubtitle":"6370906","UserID":"0","SubLanguageID":"heb","SubFormat":"srt","SubSumCD":"1","SubAuthorComment":"","SubAddDate":"2015-11-07 06:42:37","SubBad":"1","SubRating":"1.0","SubDownloadsCnt":"4702","MovieReleaseName":" the.big.bang.theory.907.hdtv.repack-lol","MovieFPS":"25.000","IDMovie":"382489","IDMovieImdb":"5073156","MovieName":"\"The Big Bang Theory\" The Spock Resonance","MovieNameEng":"","MovieYear":"2015","MovieImdbRating":"8.3","SubFeatured":"0","UserNickName":"","ISO639":"he","LanguageName":"Hebrew","SubComments":"1","SubHearingImpaired":"0","UserRank":"","SeriesSeason":"9","SeriesEpisode":"7","MovieKind":"episode","SubHD":"1","SeriesIMDBParent":"898266","SubEncoding":"UTF-8","SubDownloadLink":"http://dl.opensubtitles.org/en/download/file/src-api/vrf-19d70c5f/sid-ovfnue73tmttg0hsarpq2c8ui6/1954952199.gz","ZipDownloadLink":"http://dl.opensubtitles.org/en/download/sub/src-api/vrf-f5490bb8/sid-ovfnue73tmttg0hsarpq2c8ui6/6370906","SubtitlesLink":"http://www.opensubtitles.org/en/subtitles/6370906/sid-ovfnue73tmttg0hsarpq2c8ui6/the-big-bang-theory-the-spock-resonance-he"},{"MatchedBy":"moviehash","IDSubMovieFile":"12909231","MovieHash":"2476dfc7cc376dd0","MovieByteSize":"130751619","MovieTimeMS":"0","IDSubtitleFile":"1954495642","SubFileName":"The.Big.Bang.Theory.S08E10.Heb.srt","SubActualCD":"1","SubSize":"26605","SubHash":"ce5d6da9d5b94e2ed0efb966dcc8faa3","SubLastTS":"00:19:04","IDSubtitle":"5917132","UserID":"0","SubLanguageID":"heb","SubFormat":"srt","SubSumCD":"1","SubAuthorComment":"","SubAddDate":"2014-12-04 17:11:21","SubBad":"0","SubRating":"0.0","SubDownloadsCnt":"11562","MovieReleaseName":" The.Big.Bang.Theory.S08E10","MovieFPS":"0.000","IDMovie":"186019","IDMovieImdb":"3823250","MovieName":"\"The Big Bang Theory\" The Champagne Reflection","MovieNameEng":"","MovieYear":"2014","MovieImdbRating":"6.7","SubFeatured":"0","UserNickName":"","ISO639":"he","LanguageName":"Hebrew","SubComments":"0","SubHearingImpaired":"0","UserRank":"","SeriesSeason":"8","SeriesEpisode":"10","MovieKind":"episode","SubHD":"0","SeriesIMDBParent":"898266","SubEncoding":"CP1255","SubDownloadLink":"http://dl.opensubtitles.org/en/download/file/src-api/vrf-19d70c5a/sid-ovfnue73tmttg0hsarpq2c8ui6/1954495642.gz","ZipDownloadLink":"http://dl.opensubtitles.org/en/download/sub/src-api/vrf-f54e0bb5/sid-ovfnue73tmttg0hsarpq2c8ui6/5917132","SubtitlesLink":"http://www.opensubtitles.org/en/subtitles/5917132/sid-ovfnue73tmttg0hsarpq2c8ui6/the-big-bang-theory-the-champagne-reflection-he"},{"MatchedBy":"moviehash","IDSubMovieFile":"12937582","MovieHash":"2476dfc7cc376dd0","MovieByteSize":"130751619","MovieTimeMS":"0","IDSubtitleFile":"1954960712","SubFileName":"The.Big.Bang.Theory.S09E07.720p.HDTV.X264-DIMENSION-heb.srt","SubActualCD":"1","SubSize":"19742","SubHash":"0073f137a7bc7d5a93cff2a8514e03c5","SubLastTS":"00:18:11","IDSubtitle":"6379218","UserID":"0","SubLanguageID":"heb","SubFormat":"srt","SubSumCD":"1","SubAuthorComment":"","SubAddDate":"2015-11-12 23:51:19","SubBad":"0","SubRating":"0.0","SubDownloadsCnt":"599","MovieReleaseName":" The.Big.Bang.Theory.S09E07.720p.HDTV.X264-DIMENSION","MovieFPS":"0.000","IDMovie":"382490","IDMovieImdb":"5090816","MovieName":"\"The Big Bang Theory\" The Helium Insufficiency","MovieNameEng":"","MovieYear":"2015","MovieImdbRating":"7.3","SubFeatured":"0","UserNickName":"","ISO639":"he","LanguageName":"Hebrew","SubComments":"0","SubHearingImpaired":"0","UserRank":"","SeriesSeason":"9","SeriesEpisode":"6","MovieKind":"episode","SubHD":"1","SeriesIMDBParent":"898266","SubEncoding":"CP1255","SubDownloadLink":"http://dl.opensubtitles.org/en/download/file/src-api/vrf-19cf0c55/sid-ovfnue73tmttg0hsarpq2c8ui6/1954960712.gz","ZipDownloadLink":"http://dl.opensubtitles.org/en/download/sub/src-api/vrf-f55c0bbd/sid-ovfnue73tmttg0hsarpq2c8ui6/6379218","SubtitlesLink":"http://www.opensubtitles.org/en/subtitles/6379218/sid-ovfnue73tmttg0hsarpq2c8ui6/the-big-bang-theory-the-helium-insufficiency-he"}]

var buffer = torrent.buffer;
var Long = torrent.long;
var stream = torrent.stream;
var zlib = torrent.zlib;

var subs = {
	auth_token: false,
	video_hash: false,
	tracks: {},

	get_video_subtitles: function (file)
	{
		subs.os_auth().then(function (token)
		{
			subs.os_available_subs(token, file, 'heb,eng').then(function (srts)
			{
				if (srts.length > 0)
				{
					background.get_video_data('tt' + srts[0].IDMovieImdb).then(function (data)
					{
						app.trakt_info = data;
						cast.set_sender_poster(); //calling here in case the data returns after the user started to casting
					});

					app.video_name = srts[0].MovieName;
					document.title = app.video_name + ' - Bit Player';
					$('#window_title').html(document.title);
					controls.controls_fill_sub(srts);
				}
				else
					app.error('Subtitiles were not found.');
			}, app.error)
		}, app.error);
	},

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
			var buffers = [], total_length = 0;
			e.on("data", function (data)
			{
				buffers.push(subs.copyBuffer(data));
				total_length += data.length;
			});
			e.on("end", function ()
			{
				e.destroy();
				resolve(buffer.Buffer.concat(buffers, total_length));
			});
			e.on("error", reject);
		})
	},
	computeTorrentFileHash: function (torrent_file)
	{
		var stream_start = torrent_file.createReadStream({start: 0, end: 65535});
		var steam_end = torrent_file.createReadStream({
			start: torrent_file.length - 65536,
			end: torrent_file.length - 1
		});

		return Promise.all([subs.getStreamBuffer(stream_start), subs.getStreamBuffer(steam_end)]).then(function (t)
		{
			return subs.computeHash(torrent_file.length, t[0], t[1]);
		})
	},
	computeLocalFileHash: function (file)
	{
		var getBuffer = function (file, start, end)
		{
			return new Promise(function (resolve, reject)
			{
				var fileReader = new FileReader();
				fileReader.onload = function (e)
				{
					resolve(torrent.typedarrayToBuffer(new Uint8Array(e.target.result)));
				};
				fileReader.readAsArrayBuffer(file.slice(start, end));
			});
		};

		return Promise.all([getBuffer(file, 0, 65536), getBuffer(file, file.size - 65536, file.size)]).then(function (t)
		{
			return subs.computeHash(file.size, t[0], t[1]);
		});
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
			if (subs.auth_token)
				return resolve(subs.auth_token);

			os.api.LogIn(function (err, data)
			{
				if (err)
					return reject(err);

				subs.auth_token = data.token;
				resolve(subs.auth_token);
			}, "", "", "en", os.ua);
		});
	},

	os_available_subs: function (auth_token, torrent_file)
	{
		return new Promise(function (resolve, reject)
		{
			subs.users_languages().then(function (users_languages)
			{
				var comp_func;
				if (subs.video_hash)
				{
					comp_func = function()
					{
						return new Promise(function (resolve, reject){
							resolve(subs.video_hash);
						});
					}
				}
				else if (torrent_file instanceof File)
					comp_func = subs.computeLocalFileHash;
				else
					comp_func = subs.computeTorrentFileHash;

				comp_func(torrent_file).then(function (hash)
				{
					subs.video_hash = hash;
					console.log('video hash: ' + hash);
					os.api.SearchSubtitles(function (err, data)
					{
						if (err)
							return reject(err);

						var srts = data.data && data.data.filter(function (e)
							{
								return "srt" == e.SubFormat
							});

						resolve(srts);
					}, auth_token, [{moviehash: hash, sublanguageid: users_languages.join()}]);
				}, reject);
			});
		});
	},

	os_download_sub: function (auth_token, sub_files_id, org_encoding)
	{
		return new Promise(function (resolve, reject)
		{
			os.api.DownloadSubtitles(function (err, data)
			{
				if (err)
					return reject(err);

				if (!data.data)
					return reject('Open subtitles error: ' + data.status);

				subs.extract_gzip(data.data[0].data, org_encoding).then(function (srt)
				{
					resolve(srt);
				}, reject);

			}, auth_token, [sub_files_id]);
		});
	},

	extract_gzip: function (subfile_zip, org_encoding)
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
			});
			i.on("end", function ()
			{
				var output = buffer.Buffer.concat(output_sections, output_length);
				var t = output.toString();
				if (org_encoding && org_encoding != 'UTF-8')
					t = torrent.encoding.convert(output, "utf8", org_encoding).toString();

				resolve(t);
			});
			i.on("error", reject);
		});
	},

	set_srt: function (video, sub_id, org_encoding, srt_file)
	{
		if (sub_id)
		{
			var track = null;
			if (sub_id === 'manual')
			{
				if (subs.tracks['manual'])
					subs.tracks['manual'].mode = 'hidden';

				track = subs.tracks['manual'] = video.addTextTrack("subtitles", "English", "en");

				var fileReader = new FileReader();
				var secRead = false; //second read flag
				fileReader.onload = function (event)
				{
					var srt = event.target.result;

					if (!secRead)
					{
						secRead = true;
						var enc_data = bundle2.jschardet.detect(srt); //requires readAsBinaryString in order to detect the current encoding
						fileReader.readAsText(srt_file, enc_data.encoding); //now read with the right encoding
					}
					else
					{
						subs.srt_to_track(srt, track);
					}
				};
				fileReader.readAsBinaryString(srt_file); //this option will be deprecated in the future (should consider a better way to detect encoding)
			}
			else
			{
				var os_org_id = sub_id;
				sub_id = '_' + sub_id;
				if (!subs.tracks[sub_id])
				{
					track = subs.tracks[sub_id] = video.addTextTrack("subtitles", "English", "en");
					subs.os_download_sub(subs.auth_token, os_org_id, org_encoding).then(function (srt)
					{
						subs.srt_to_track(srt, track);
					}, app.error);
				}
			}
		}

		http.sub = null;
		$.each(subs.tracks, function (i, track)
		{
			track.mode = i == sub_id ? 'showing' : 'hidden';
			if (i == sub_id)
				http.sub = track;
		});
		cast.load_media();
	},

	srt_to_track: function (srt, track)
	{
		var cues = subs.parse_srt(srt, true);
		var punctuation = /^[.,!?:]*/;
		for (var ci in cues)
		{
			var cue = cues[ci];

			//fix rtl common rtl problem, where the punctuations marks are at the beginning instead at the end.
			cue.text = cue.text.split("\n").map(function (l)
			{
				var p = punctuation.exec(l)[0];
				if (p)
					l = l.replace(punctuation, '') + p;
				return l;
			}).join("\n");

			//https://w3c.github.io/webvtt/
			var vttCue = new VTTCue(cue.startTime / 1000, cue.endTime / 1000, cue.text);
			//vttCue.line = 15; //0 - 10
			track.addCue(vttCue);
		}
		track.ready = true;
		track.onReady && track.onReady();
	},

	track_to_srt: function(track)
	{
		var vtt = '';
		vtt += "WEBVTT\n\n";
		for (var ci = 0; ci < track.cues.length; ci++)
		{
			var cue = track.cues[ci];
			vtt += subs.seconds_to_hhmmss(cue.startTime) + ' --> ' + subs.seconds_to_hhmmss(cue.endTime) + "\n";
			vtt += cue.text + "\n\n";
		}
		return vtt;
	},

	//based on: https://github.com/bazh/subtitles-parser/blob/master/index.js
	parse_srt: function (srt, ms)
	{
		var useMs = ms ? true : false;

		srt = srt.replace(/\r/g, '');
		var time_regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
		srt = srt.split(time_regex);
		srt.shift();

		var items = [];
		for (var i = 0; i < srt.length; i += 4)
		{
			items.push({
				id: srt[i].trim(),
				startTime: useMs ? subs.timeMs(srt[i + 1].trim()) : srt[i + 1].trim(),
				endTime: useMs ? subs.timeMs(srt[i + 2].trim()) : srt[i + 2].trim(),
				text: srt[i + 3].trim()
			});
		}

		return items;
	},

	timeMs: function (val)
	{
		var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
		var parts = regex.exec(val);

		if (parts === null)
		{
			return 0;
		}

		for (var i = 1; i < 5; i++)
		{
			parts[i] = parseInt(parts[i], 10);
			if (isNaN(parts[i])) parts[i] = 0;
		}

		// hours + minutes + seconds + ms
		return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
	},

	seconds_to_hhmmss: function (totalSeconds)
	{
		var hours = Math.floor(totalSeconds / 3600);
		var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
		var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
		seconds = seconds.toFixed(3);

		var result = (hours < 10 ? "0" + hours : hours);
		result += ":" + (minutes < 10 ? "0" + minutes : minutes);
		result += ":" + (seconds < 10 ? "0" + seconds : seconds);
		return result;
	},

	//get/set subtitles size
	subtitles_size: function (size)
	{
		if (undefined !== size) //set
		{
			chrome.storage.local.set({subtitles_size: size});
		}
		else //get
		{
			return new Promise(function (resolve, reject)
			{
				chrome.storage.local.get('subtitles_size', function (data)
				{
					resolve(data['subtitles_size'] || 1);
				});
			})
		}
	},

	subtitles_size_cast: function (size)
	{
		if (undefined !== size) //set
		{
			chrome.storage.local.set({subtitles_size_cast: size});
		}
		else //get
		{
			return new Promise(function (resolve, reject)
			{
				chrome.storage.local.get('subtitles_size_cast', function (data)
				{
					resolve(data['subtitles_size_cast'] || 1);
				});
			})
		}
	},


	//get/set user's last used language
	prefered_sub_lang: function (language)
	{
		if (undefined !== language) //set
		{
			chrome.storage.local.set({prefered_sub_lang: language});
		}
		else //get
		{
			return new Promise(function (resolve, reject)
			{
				chrome.storage.local.get('prefered_sub_lang', function (data)
				{
					resolve(data['prefered_sub_lang']);
				});
			})
		}
	},

	//get/set the languages the user can read :)
	users_languages: function (lng_ids)
	{
		if ($.isArray(lng_ids)) //set
		{
			chrome.storage.sync.set({users_lng_ids: lng_ids});
			if (subs.video_hash) //if false, then the original call is already busy and will use the updated list
				subs.get_video_subtitles();
		}
		else //get
		{
			return new Promise(function (resolve, reject)
			{
				chrome.storage.sync.get(['users_lng_ids'], function (data)
				{
					data = data['users_lng_ids'] || [];
					data.push('eng');
					resolve(data);
				});
			})
		}
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