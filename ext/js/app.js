;
//var myTorrent = 'magnet:?xt=urn:btih:dede096ae7dd90aa868dde218a2626f00a6ae610&dn=Arrow+S02E17+HDTV+x264-LOL+%5Beztv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
var myTorrent = 'magnet:?xt=urn:btih:090c797d6c3bdcdae733527d9a275586ca5b55ae&dn=The+Big+Bang+Theory+S09E07+HDTV+x264+REPACK-LOL&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';

app = {
	torrent: null,
	start: function ()
	{
		console.log(subs.lang_ids);
		app.torrent = torrent.TorrentStream(myTorrent, {
			verify: false,
			storage: torrent.MemoryStorage,
			connections: 50,
			uploads: 10,
			dht: true,
			tracker: true
		});

		//this.torrent.listen(6666);

		this.torrent.on("ready", function ()
		{
			var video_index = app.best_file(app.torrent.files);
			console.error('here', video_index);
			if (0 > video_index)
				$('#error').text('dang!');
			else
			{
				setInterval(function ()
				{
					$('#meta').text(
						'Download speed:' + app.formatBytes(app.torrent.swarm.downloadSpeed()) +
						', downloaded:' + app.formatBytes(app.torrent.swarm.downloaded) + '/' + app.formatBytes(app.torrent.files[video_index].length) +
							//', Upload speed:' + app.formatBytes(app.torrent.swarm.uploadSpeed()) +
							//', uploaded:' + app.formatBytes(app.torrent.swarm.uploaded) +
						', peers:' + app.torrent.swarm.connections.length
					);
				}, 500);

				var t = torrent.HttpServer(app.torrent);
				t.listen(0, function ()
				{
					app.torrent.httpPort = t.address().port; //save port for later use

					var src = "http://localhost:" + app.torrent.httpPort + "/" + video_index + "/" + app.torrent.files[video_index].name;
					$('#note').append($('<a target="_blank"></a>').text(src).attr('href', src));
					$('video').attr('type', 'video/mp4').attr('src', src);
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
	}
};