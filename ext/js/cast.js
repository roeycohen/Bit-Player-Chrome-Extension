;
//https://developers.google.com/cast/docs/chrome_sender
var cast = {
	available: false,
	session: null,
	media: null,
	url: null,
	entry: function ()
	{
		//cast.detect_devices();
		//cast.self_address();
		window['__onGCastApiAvailable'] = function (loaded, errorInfo)
		{
			if (loaded)
				cast.initialize_cast_api();
		};
	},
	initialize_cast_api: function ()
	{
		var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
			function (e)
			{
				//sessionListener
			}, function (e)
			{
				//receiverListener
				cast.available = e === chrome.cast.ReceiverAvailability.AVAILABLE;
				console.log('cast.available', cast.available);
			});
		chrome.cast.initialize(apiConfig, function(){}, function(){});
	},
	load_media: function ()
	{
		chrome.cast.requestSession(function (session)
		{
			$('#casting_bg').show();

			cast.session = session;

			var mediaInfo = new chrome.cast.media.MediaInfo(cast.url);
			mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
			mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
			mediaInfo.contentType = 'video/mp4';
			var request = new chrome.cast.media.LoadRequest(mediaInfo);
			request.currentTime = controls.video.currentTime;

			if (http.sub)
			{
				var cTrack = new chrome.cast.media.Track(1, chrome.cast.media.TrackType.TEXT);
				cTrack.trackContentId = "http://192.168.3.102:" + http.server.address().port + "/sub.vtt";
				cTrack.trackContentType = 'text/vtt';
				cTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
				cTrack.name = 'Subtitles';
				cTrack.language = 'en-US';
				cTrack.customData = null;

				mediaInfo.customData = null;
				mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
				mediaInfo.textTrackStyle = cast.sub_style();
				mediaInfo.duration = null;
				mediaInfo.tracks = [cTrack];

				request.activeTrackIds = [1];
			}

			cast.session.loadMedia(request, cast.onMediaDiscovered.bind(this, 'loadMedia'), cast.onMediaError);

		}, function (e)
		{
			if (cast.media)
			{
				cast.media.removeUpdateListener(controls.controls_update_from_cast);
				cast.media = null;
			}
			if (controls.cast_time)
				controls.video.currentTime = controls.cast_time;
			$('#casting_bg').hide();
			console.log('error', e)
		});
	},
	onMediaDiscovered: function (how, media)
	{
		console.log('onMediaDiscovered', how);
		cast.media = media;
		media.addUpdateListener(controls.controls_update_from_cast);
	},
	onMediaError: function (e)
	{
		console.log('onMediaError', e);
	},
	// ======================================================================
	sub_style: function(font_scale)
	{
		if (!font_scale)
			font_scale = controls.subtitles_size_cast;

		var tts = new chrome.cast.media.TextTrackStyle();
		tts.backgroundColor = '#00000000';
		tts.edgeColor = '#000000';
		tts.edgeType = chrome.cast.media.TextTrackEdgeType.SANS_SERIF;
		tts.fontGenericFamily = chrome.cast.media.TextTrackFontGenericFamily.SERIF;
		tts.fontScale = font_scale;

		return tts;
	},
	detect_devices: function ()
	{
		chrome.mdns.onServiceList.addListener(
			function (e)
			{
				console.log('mdns.onServiceList', e);
			},
			{
				'serviceType': '_googlecast._tcp.local'
			}
		);
	},
	self_address: function ()
	{
		chrome.system.network.getNetworkInterfaces(function (interfaces)
		{
			console.log('getNetworkInterfaces', interfaces);
		});
	}
};