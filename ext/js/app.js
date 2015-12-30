;
//var myTorrent = 'magnet:?xt=urn:btih:dede096ae7dd90aa868dde218a2626f00a6ae610&dn=Arrow+S02E17+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
var myTorrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

console.log(torrent);

app = {
	torrent: null,
	start: function ()
	{
		var subfile_zip = "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…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"
		subs.extract_gzip(subfile_zip).then(function(data){
			console.log(data);
		}/*, function(e){
			console.log('basa', e);
		}*/);
		return;
		//subs.os_auth().then(function (token)
		//{
		//	subs.os_download_sub(token, ['1954952199']).then(function (data)
		//	{
		//		console.log('downloaded data', data);
		//	});
		//});
		//return;
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