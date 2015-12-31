;
//var myTorrent = 'magnet:?xt=urn:btih:dede096ae7dd90aa868dde218a2626f00a6ae610&dn=Arrow+S02E17+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
var myTorrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

console.log(torrent);

app = {
	torrent: null,
	start: function ()
	{
		var cue_style = document.getElementById('subs_style').sheet.cssRules[0].style;

		$('#plus').click(function ()
		{
			var cur_size = parseFloat(cue_style.getPropertyValue('font-size'));
			cue_style.setProperty('font-size', (cur_size + 0.1) + 'em', null);
		});
		$('#minus').click(function ()
		{
			var cur_size = parseFloat(cue_style.getPropertyValue('font-size'));
			cue_style.setProperty('font-size', (cur_size - 0.1) + 'em', null);
		});
		return;
		subs.os_auth().then(function (token)
		{
			subs.os_download_sub(token, ['1954952199']).then(function (data)
			{
				console.log(data); //now convert to vtt
			});
		});
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
					$('#meta').text(
						'Download speed:' + app.formatBytes(app.torrent.swarm.downloadSpeed()) +
						', downloaded:' + app.formatBytes(app.torrent.swarm.downloaded) + '/' + app.formatBytes(torrent_file.length) +
							//', Upload speed:' + app.formatBytes(app.torrent.swarm.uploadSpeed()) +
							//', uploaded:' + app.formatBytes(app.torrent.swarm.uploaded) +
						', peers:' + app.torrent.swarm.connections.length
					);
				}, 500);

				subs.os_auth().then(function (token)
				{
					console.log('token', token);
					subs.os_available_subs(token, torrent_file, 'heb').then(function (srts)
					{
						app.error('hi');
						console.log('srts', srts);
						if (srts.length)
						{
							console.log('IDSubtitleFile', srts[0].IDSubtitleFile); //"1954952199"
							subs.os_download_sub(token, [srts[0].IDSubtitleFile]).then(function (data)
							{
								console.log('downloaded data', data);
							});
						}
					})
				});
				//subs.get_opensubtitles(torrent_file).then(function(data){
				//	console.log('get_opensubtitles', data);
				//});

				//var t = torrent.HttpServer(app.torrent);
				//t.listen(0, function ()
				//{
				//	app.torrent.httpPort = t.address().port; //save port for later use
				//
				//	var src = "http://localhost:" + app.torrent.httpPort + "/" + video_index + "/" + torrent_file.name;
				//	$('#note').append($('<a target="_blank"></a>').text(src).attr('href', src));
				//	$('video').attr('type', 'video/mp4').attr('src', src);
				//});
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
		chrome.notifications.create("subtitles", {
				type: "basic",
				title: "Subtitles",
				iconUrl: "../images/icon64.png",
				message: error
			},
			function () // The callback is required before Chrome 42.
			{
			}
		);
	}
};