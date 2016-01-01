;
var myTorrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//var myTorrent = 'magnet:?xt=urn:btih:d0a1545f5b1c3dc22b14cdeab7fd6b042e13cda7&dn=Arrow+S02E18+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

//console.log(torrent);

app = {
	torrent: null,
	video: null,
	$video: null,
	$ctrls: null,
	start: function ()
	{
		app.video = document.getElementById("video");
		app.$video = $(app.video);
		app.$ctrls = $('#controls');
		app.controls();

		subs.os_auth().then(function (token)
		{
			os.api.SearchSubtitles(function (err, data)
			{
				if (err)
					this.error(err);

				var srts = data.data && data.data.filter(function (e)
					{
						return "srt" == e.SubFormat
					});

				app.controls_fill_sub(srts);
			}, token, [{moviehash: '2476dfc7cc376dd0', sublanguageid: 'heb'}]); //1954197964
		}, app.error);

		return;

		app.torrent = torrent.TorrentStream(myTorrent, {
			verify: false,
			storage: torrent.MemoryStorage,
			connections: 50,
			uploads: 10,
			dht: true,
			tracker: true
		});

		//this.torrent.listen(6666);
		console.log('fetching torrent...');
		this.torrent.on("ready", function ()
		{
			console.log('torrent ready');
			var video_index = app.best_file(app.torrent.files);
			if (0 > video_index)
				$('#error').text('dang!');
			else
			{
				var torrent_file = app.torrent.files[video_index];
				console.log('torrent_file', torrent_file);
				setInterval(function ()
				{
					$('#status').text(
						app.formatBytes(app.torrent.swarm.downloadSpeed()) + 'ps, ' +
						app.formatBytes(app.torrent.swarm.downloaded) + '/' + app.formatBytes(torrent_file.length) + ' (' + (torrent_file.length == 0 ? 0 : Math.round(100 * app.torrent.swarm.downloaded * 100 / torrent_file.length) / 100 ) + '%)'
					);
				}, 500);

				subs.os_auth().then(function (token)
				{
					console.log('token', token);
					subs.os_available_subs(token, torrent_file, 'heb').then(function (srts)
					{
						console.log('srts', srts);
						if (srts.length)
						{
							console.log('IDSubtitleFile', srts[0].IDSubtitleFile); //"1954952199"
							subs.os_download_sub(token, [srts[0].IDSubtitleFile]).then(function (data)
							{
								subs.set_srt(app.video, data);
							}, app.error);
						}
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
				best_match_index = i;
		});
		return best_match_index;
	},
	formatBytes: function (bytes)
	{
		if (isNaN(bytes) || bytes == 0)
			return '0';

		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
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
	controls: function ()
	{

		var hideControlsTimeout = null;
		app.$video.click(function ()
		{
			app.video.paused ? app.video.play() : video.pause();
		});

		app.$video.on('playing play', function ()
		{
			$('#status').css('opacity', 0);
			hideControlsTimeout && clearTimeout(hideControlsTimeout);
			hideControlsTimeout = window.setTimeout(function ()
			{
				app.$ctrls.hide();
			}, 3000);
		});
		app.$video.on('waiting pause', function ()
		{
			$('#status').css('opacity', 1);
			hideControlsTimeout && clearTimeout(hideControlsTimeout);
			app.$ctrls.show();
		});

		app.$video.on('mousemove', function ()
		{
			hideControlsTimeout && clearTimeout(hideControlsTimeout);
			app.$ctrls.show();

			if (!app.video.paused)
				hideControlsTimeout = window.setTimeout(function ()
				{
					app.$ctrls.hide();
				}, 3000);
		});

		//subtitles size
		var cue_style = document.getElementById('subs_style').sheet.cssRules[0].style;
		app.$ctrls.find('#plus').click(function ()
		{
			var cur_size = parseFloat(cue_style.getPropertyValue('font-size'));
			cue_style.setProperty('font-size', (cur_size + 0.1) + 'em', null);
		});
		app.$ctrls.find('#minus').click(function ()
		{
			var cur_size = parseFloat(cue_style.getPropertyValue('font-size'));
			cue_style.setProperty('font-size', (cur_size - 0.1) + 'em', null);
		});
		app.$ctrls.find('#sub_select .context_menu').on('click', 'li', function()
		{
			var $li = $(this);
			$li.siblings().removeClass('active');
			$li.addClass('active');

			subs.set_srt(app.video, $li.data('sub_id'));
		});
	},
	controls_fill_sub: function(srts)
	{
		var $cm = app.$ctrls.find('#sub_select .context_menu');
		$cm.html('<li class="active"><i>Off</i></li>');
		$.each(srts, function(i, srt){
			if (i === 0)
				document.title = srt.MovieName + ' - Popcorn Player';
			$cm.append(
				$('<li></li>').text(srt.MovieReleaseName + ' (' + srt.LanguageName + ')' + ' ' + srt.IDSubtitleFile).data('sub_id', srt.IDSubtitleFile)
			);
		});
	}
};