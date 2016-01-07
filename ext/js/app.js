;
var test_torrent;
//big bang (hash: 2476dfc7cc376dd0)
//test_torrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//arrow 18: test_torrent = 'magnet:?xt=urn:btih:d0a1545f5b1c3dc22b14cdeab7fd6b042e13cda7&dn=Arrow+S02E18+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//sicario
//test_torrent = 'magnet:?xt=urn:btih:c8dc3ad5b55b6a519475149a790c7d1072aab7c5&dn=Arrow+S02E19+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//arrow 19
//test_torrent = 'magnet:?xt=urn:btih:c8dc3ad5b55b6a519475149a790c7d1072aab7c5&dn=Arrow+S02E19+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//tarzan (hash: 62a191d72edb3cd0)
//test_torrent = 'magnet:?xt=urn:btih:UXSMUUXKIQKZEVFOZ7J6GAMUDMTW3VLO&dn=Tarzan+(1999)+720p+BrRip+x264+YIFY&tr=udp://tracker.openbittorrent.com:80/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.blackunicorn.xyz:6969/announce&tr=udp://glotorrents.pw:6969/announce';
//console.log(torrent);

app = {
	torrent: null,
	video: null,
	$video: null,
	$ctrls: null,
	entry: function (torrent_url)
	{
		background.entry();

		torrent_url = torrent_url || test_torrent;

		app.video = document.getElementById("video");
		app.$video = $(app.video);
		app.$ctrls = $('#controls');
		app.controls();

		$(window).resize(function ()
		{
			app.$video.css('width', $(window).width());
			app.$video.css('height', $(window).height());
		}).trigger('resize');

		if (torrent_url)
			app.start_video(torrent_url);
	},
	start_video: function (torrent_url)
	{
		$('#welcome').hide();
		$('#loader').show();

		//background.stop();
		//$('#loader, #help_link').slideUp();
		//$('#player').slideDown();
		//subs.os_auth().then(function (token)
		//{
		//	os.api.SearchSubtitles(function (err, data)
		//	{
		//		if (err)
		//			this.error(err);
		//
		//		var srts = data.data && data.data.filter(function (e)
		//			{
		//				return "srt" == e.SubFormat
		//			});
		//
		//		app.controls_fill_sub(srts);
		//	}, token, [{moviehash: '2476dfc7cc376dd0', sublanguageid: 'heb,eng'}]); //1954197964
		//}, app.error);
		//return;

		app.torrent = torrent.TorrentStream(torrent_url, {
			verify: false,
			storage: torrent.MemoryStorage,
			connections: 50,
			uploads: 10,
			dht: true,
			tracker: true
		});

		//this.torrent.listen(6666);
		$('#load_status').text('Fetching torrent data...');
		this.torrent.on("ready", function ()
		{
			console.log('torrent ready');
			var video_index = app.best_file(app.torrent.files);
			if (0 > video_index)
				$('#error').text('dang!');
			else
			{
				$('#load_status').text('Downloading...');

				var torrent_file = app.torrent.files[video_index];
				console.log('torrent_file', torrent_file);
				setInterval(function ()
				{
					var status_text = app.formatBytes(app.torrent.swarm.downloadSpeed()) + 'ps, ' +
						app.formatBytes(app.torrent.swarm.downloaded) + '/' + app.formatBytes(torrent_file.length) + ' (' + (torrent_file.length == 0 ? 0 : Math.round(100 * app.torrent.swarm.downloaded * 100 / torrent_file.length) / 100 ) + '%), ' +
						app.torrent.swarm.connections.length + ' peers';
					$('#download_status, #status').text(status_text);
				}, 500);

				subs.os_auth().then(function (token)
				{
					subs.os_available_subs(token, torrent_file, 'heb,eng').then(function (srts)
					{
						if (srts.length > 0)
							app.controls_fill_sub(srts);
						else
							app.error('subtitiles not found');
					}, app.error)
				}, app.error);

				var t = torrent.HttpServer(app.torrent);
				t.listen(0, function ()
				{
					app.torrent.httpPort = t.address().port; //save port for later use

					var src = "http://localhost:" + app.torrent.httpPort + "/" + video_index + "/" + torrent_file.name;
					//$('#note').append($('<a target="_blank"></a>').text(src).attr('href', src));
					app.$video.attr('type', 'video/mp4').attr('src', src);
				});
			}
		});
	},
	best_file: function (files)
	{
		var biggest_file = 1;
		var best_match_index = -1;
		$.each(files, function (i, f)
		{
			var extension = f.path.substr((~-f.path.lastIndexOf(".") >>> 0) + 2);
			if ($.inArray(extension, ['mp4', 'avi', 'mkv']) > -1 && f.length > biggest_file)
			{
				biggest_file = f.length;
				best_match_index = i;
			}
		});
		return best_match_index;
	},
	formatBytes: function (bytes)
	{
		if (isNaN(bytes) || bytes == 0)
			return '0 B';

		var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	},
	error: function (error)
	{
		console.log('error method: ', error);

		chrome.notifications.create("subtitles", {
				type: "basic",
				title: "Subtitles",
				iconUrl: "../images/icon64.png",
				message: $.type(error) === "string" ? error : JSON.stringify(error)
			},
			function () // The callback is required before Chrome 42.
			{
			}
		);
	},
	hideControlsTimeout: null,
	toggle_controls: function (on)
	{
		if (true === on)
		{
			$('#status').css('opacity', 1);
			app.$ctrls.show();
			app.$video.css({cursor: 'default'});

			app.hideControlsTimeout && clearTimeout(app.hideControlsTimeout);
			if (!app.video.paused)
			{
				app.hideControlsTimeout = window.setTimeout(function ()
				{
					app.toggle_controls(false);
				}, 3000);
			}
		}
		else
		{
			$('#status').css('opacity', 0);
			app.$ctrls.hide();
			app.$video.css({cursor: 'none'});
		}
	},
	controls: function ()
	{
		$('#welcome input').on('change keyup keydown', function ()
		{
			var url = $(this).val();
			if (url.match(/^magnet:*/))
				app.start_video(url);
			else
				$(this).val('');
		});
		app.video.oncanplay = function ()
		{
			background.stop();
			$('#loader, #help_link').slideUp();
			$('#player').slideDown();
		};

		//mouse play/pause
		app.$video.click(function ()
		{
			if (app.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
				return;
			app.video.paused ? app.video.play() : video.pause();
		});

		//keyboard
		$(document).on('keydown', function (e)
		{
			if (app.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
				return;

			switch (e.keyCode)
			{
				case 32: //space
					app.video.paused ? app.video.play() : video.pause();
					break;
				case 39: //right arrow
					app.video.currentTime += 10;
					break;
				case 37: //left arrow
					app.video.currentTime -= 10;
					break;
				case 38: //up arrow
					app.video.currentTime += 60;
					break;
				case 40: //down arrow
					app.video.currentTime -= 60;
					break;
			}
		});

		app.$video.on('playing play waiting pause mousemove', function ()
		{
			app.toggle_controls(true);
		});

		//subtitles
		var cue_style = document.getElementById('subs_style').sheet.cssRules[0].style;
		var set_font_size = function (increase)
		{
			var cur_size = parseFloat(cue_style.getPropertyValue('font-size'));
			var new_size = (cur_size + (increase ? 0.1 : -0.1) + 'em');
			cue_style.setProperty('font-size', new_size, null);
			chrome.storage.local.set({subtitles_size: new_size});
		};

		chrome.storage.local.get('subtitles_size', function (data)
		{
			if ('subtitles_size' in data)
				cue_style.setProperty('font-size', data['subtitles_size'], null);
		});

		app.$ctrls.find('#plus').click(function ()
		{
			set_font_size(true);
		});
		app.$ctrls.find('#minus').click(function ()
		{
			set_font_size(false);
		});
		app.$ctrls.find('#sub_select .context_menu').on('click', 'li', function ()
		{
			var $li = $(this);
			$li.siblings().removeClass('active');
			$li.addClass('active');

			var sub_data = $li.data();
			chrome.storage.local.set({prefered_sub_lang: sub_data.language || null}); //assuming the user will always use the same subtitles language...
			subs.set_srt(app.video, sub_data.sub_id, sub_data.encoding);
		});
	},
	controls_fill_sub: function (srts)
	{
		chrome.storage.local.get(['prefered_sub_lang'], function(data)
		{
			var $srt_li_to_load = null;
			var $sub_select = app.$ctrls.find('#sub_select').show();
			var $cm = $sub_select.find('.context_menu');
			$cm.html('<li class="active"><i>Off</i></li>');
			$.each(srts, function (i, srt)
			{
				if (i === 0)
					document.title = srt.MovieName + ' - Popcorn Player';

				var $li = $('<li></li>').text(srt.MovieReleaseName + ' (' + srt.LanguageName + ')').data({
					sub_id: srt.IDSubtitleFile,
					language: srt.SubLanguageID,
					encoding: srt.SubEncoding
				});

				$cm.append($li);

				if (!$srt_li_to_load && data.prefered_sub_lang === srt.SubLanguageID)
					$srt_li_to_load = $li;
			});
			$srt_li_to_load && $srt_li_to_load.trigger('click');
		})
	}
};
