;
var test_torrent;
//big bang (hash: 2476dfc7cc376dd0)
//test_torrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//arrow 18:
// test_torrent = 'magnet:?xt=urn:btih:d0a1545f5b1c3dc22b14cdeab7fd6b042e13cda7&dn=Arrow+S02E18+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//sicario
//test_torrent = 'magnet:?xt=urn:btih:c8dc3ad5b55b6a519475149a790c7d1072aab7c5&dn=Arrow+S02E19+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//arrow 19
//test_torrent = 'magnet:?xt=urn:btih:c8dc3ad5b55b6a519475149a790c7d1072aab7c5&dn=Arrow+S02E19+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
//tarzan (hash: 62a191d72edb3cd0)
//test_torrent = 'magnet:?xt=urn:btih:UXSMUUXKIQKZEVFOZ7J6GAMUDMTW3VLO&dn=Tarzan+(1999)+720p+BrRip+x264+YIFY&tr=udp://tracker.openbittorrent.com:80/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.blackunicorn.xyz:6969/announce&tr=udp://glotorrents.pw:6969/announce';
//avi sample: streaming does work with it...
//test_torrent = 'magnet:?xt=urn:btih:b662dbf7f84740b9fa1a332ce42c3f2859727134&dn=Marvels.Jessica.Jones.S01E05.WEBRip.XviD-FUM%5Bettv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
// test_torrent = 'https://yifymovie.re/torrents/deadpool-2016-1080p.torrent';
//console.log(torrent);

app = {
	torrent: null,
	torrent_fetch_success: false,
	video_name: null,
	trakt_info: null,
	entry: function (torrent_url)
	{
		torrent_url = torrent_url || test_torrent;

		background.entry();
		http.start();
		controls.init();
		cast.entry();

		app.detect_extension(function (exists)
		{
			if (!exists)
				$('#launcher_link').show();
		});

		//$('#welcome, #loader, #help_link').hide();
		//$('#player').show();

		if (torrent_url)
			app.start_video(torrent_url);
	},
	start_video_local: function (file)
	{
		http.file = file;

		$('#video').attr('type', 'video/mp4').attr('src', window.URL.createObjectURL(file));

		subs.get_video_subtitles(file);
	},
	start_video: function (torrent_url)
	{
		if (typeof torrent_url === 'string')
		{
			//handling url to a torrent file
			var parser = document.createElement('a');
			parser.href = torrent_url;
			if (['http:', 'https:'].indexOf(parser.protocol) >= 0 &&
				app.file_extension(parser.pathname).toLowerCase() === 'torrent')
			{
				$('#welcome').hide();
				$('#loader').show();
				$('#load_status').text('Downloading torrent file...');

				var xhr = new XMLHttpRequest();
				xhr.open('GET', torrent_url);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function ()
				{
					if (this.status == 200)
						app.start_video(torrent.typedarrayToBuffer(new Uint8Array(xhr.response)));
				};
				xhr.send();
				return;
			}
		}

		$('#welcome').hide();
		$('#loader').show();
		$('#load_status').text('Fetching torrent data...');

		var retry_count = 0;
		var torrent_options = {
			verify: false,
			storage: torrent.MemoryStorage,
			connections: 100,
			uploads: 10,
			dht: true,
			tracker: true
		};

		var ts = torrent.TorrentStream(torrent_url, torrent_options, app.on_torrent_ready); //registering ready event after this call didn't work as the event was called earlier
		//ts.listen(6666); //not sure why was it good for...

		// for some reason, sometimes when a torrent fails to start a restart help.
		var retry_timer = window.setInterval(function ()
		{
			if (!app.torrent_fetch_success)
			{
				ts.remove(function ()
				{
					ts.destroy(function ()
					{
						retry_count++;
						$('#load_status').text('Fetching torrent data... (retry #' + retry_count + ')');
						$('.download_status').text('When everything fails... a restart may help.');

						ts = torrent.TorrentStream(torrent_url, torrent_options, app.on_torrent_ready);
					});
				});
			}
			else
				clearInterval(retry_timer);
		}, 150000); //15 secs

	},
	on_torrent_ready: function (ts)
	{
		if (ts.files.length === 0)
			return; //looks like there's a bug that sometimes calls on ready event more than once when the first time returns an empty files array.

		app.torrent_fetch_success = true;

		var video_index = app.best_file(ts.files);
		if (0 > video_index)
			$('#load_status').text('No video file found :(');
		else
		{
			$('#load_status').text('Downloading...');

			var torrent_file = ts.files[video_index];
			console.log('torrent_file', torrent_file);
			setInterval(function ()
			{
				var status_text = app.formatBytes(ts.swarm.downloadSpeed()) + 'ps, ' +
					app.formatBytes(ts.swarm.downloaded) + '/' + app.formatBytes(torrent_file.length) + ' (' + (torrent_file.length == 0 ? 0 : Math.min(100, Math.round(100 * ts.swarm.downloaded * 100 / torrent_file.length) / 100) ) + '%), ' +
					ts.swarm.connections.length + ' peers';
				$('.download_status').text(status_text);
			}, 500);

			subs.get_video_subtitles(torrent_file);

			http.file = torrent_file;
			var src = "http://localhost:" + http.server.address().port + "/" + torrent_file.name;

			$('#status a').attr('href', src);
			$('#video').attr('type', 'video/mp4').attr('src', src);
		}
	},
	best_file: function (files)
	{
		var biggest_file = 1;
		var best_match_index = -1;
		$.each(files, function (i, f)
		{
			if ($.inArray(app.file_extension(f.path).toLowerCase(), ['mp4', 'mkv']) > -1 && f.length > biggest_file)
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

		var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		var i = Math.floor(Math.log(bytes) / Math.log(1024));
		return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
	},
	error: function (error, id, buttons)
	{
		console.log('error method: ', error);

		chrome.notifications.create(id || "bit-player", {
				type: "basic",
				title: "Bit Player",
				iconUrl: "../images/icon64.png",
				message: $.type(error) === "string" ? error : JSON.stringify(error),
				buttons: buttons || []
			},
			function () // The callback is required before Chrome 42.
			{
			}
		);
	},
	//finds out whether the launcher extension is available (if not, a link to install will be shown)
	detect_extension: function (callback)
	{
		var img = new Image();
		img.onload = function ()
		{
			callback(true);
		};
		img.onerror = function ()
		{
			callback(false);
		};
		img.src = "chrome-extension://andfnelfgfdifognepabogfledhdijhn/images/icon16.png";
	},
	file_extension: function (name)
	{
		return name.substr((~-name.lastIndexOf(".") >>> 0) + 2)
	}
};
