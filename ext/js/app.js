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
	entry: function (torrent_url)
	{
		torrent_url = torrent_url || test_torrent;
		background.entry();
		controls.init();

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
		//		controls.controls_fill_sub(srts);
		//	}, token, [{moviehash: '2476dfc7cc376dd0', sublanguageid: 'heb,eng'}]); //1954197964
		//}, app.error);
		//return;

		var torrent_fetch_success = false;
		var retry_count = 0;
		var torrent_options = {
			verify: false,
			storage: torrent.MemoryStorage,
			connections: 100,
			uploads: 10,
			dht: true,
			tracker: true
		};
		$('#load_status').text('Fetching torrent data...');
		app.torrent = torrent.TorrentStream(torrent_url, torrent_options);

		// for some reason, sometimes when a torrent fails to start a restart help.
		var retry_timer = window.setInterval(function ()
		{
			if (!torrent_fetch_success)
			{
				app.torrent.remove(function ()
				{
					app.torrent.destroy(function ()
					{
						retry_count++;
						$('#load_status').text('Fetching torrent data... (retry #' + retry_count + ')');
						app.torrent = torrent.TorrentStream(torrent_url, torrent_options);
					});
				});
			}
			else
				clearInterval(retry_timer);
		}, 15000); //15 secs

		//this.torrent.listen(6666);

		this.torrent.on("ready", function ()
		{
			torrent_fetch_success = true;

			var video_index = app.best_file(app.torrent.files);
			if (0 > video_index)
				$('#load_status').text('No video file found :(');
			else
			{
				$('#load_status').text('Downloading...');

				var torrent_file = app.torrent.files[video_index];
				console.log('torrent_file', torrent_file);
				setInterval(function ()
				{
					var status_text = app.formatBytes(app.torrent.swarm.downloadSpeed()) + 'ps, ' +
						app.formatBytes(app.torrent.swarm.downloaded) + '/' + app.formatBytes(torrent_file.length) + ' (' + (torrent_file.length == 0 ? 0 : Math.min(100, Math.round(100 * app.torrent.swarm.downloaded * 100 / torrent_file.length) / 100) ) + '%), ' +
						app.torrent.swarm.connections.length + ' peers';
					$('.download_status').text(status_text);
				}, 500);

				subs.os_auth().then(function (token)
				{
					subs.os_available_subs(token, torrent_file, 'heb,eng').then(function (srts)
					{
						if (srts.length > 0)
							controls.controls_fill_sub(srts);
						else
							app.error('subtitiles not found');
					}, app.error)
				}, app.error);

				var t = torrent.HttpServer(app.torrent);
				t.listen(0, function ()
				{
					app.torrent.httpPort = t.address().port; //save port for later use
					$('#status a').attr('href', "http://localhost:" + app.torrent.httpPort + "/" + video_index + "/" + torrent_file.name);
					var src = "http://localhost:" + app.torrent.httpPort + "/" + video_index + "/" + torrent_file.name;
					//$('#note').append($('<a target="_blank"></a>').text(src).attr('href', src));
					$('#video').attr('type', 'video/mp4').attr('src', src);
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
	}
};
