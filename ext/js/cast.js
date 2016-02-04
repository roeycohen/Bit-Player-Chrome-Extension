;
var cast = {
	available: false,
	current_media_session: false,
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
	load_media: function()
	{
		chrome.cast.requestSession(function (e)
		{
			console.log('here');
			session = e;

			//if (session.media.length != 0)
			//	cast.onMediaDiscovered('onRequestSession', session.media[0]);

			//https://developers.google.com/cast/docs/chrome_sender

			session.addMediaListener(cast.onMediaDiscovered.bind(this, 'addMediaListener'));

			var mediaInfo = new chrome.cast.media.MediaInfo(cast.url);
			mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
			mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
			mediaInfo.contentType = 'video/mp4';
			var request = new chrome.cast.media.LoadRequest(mediaInfo);

			if (http.sub)
			{
				var cTrack = new chrome.cast.media.Track(1, chrome.cast.media.TrackType.TEXT);
				cTrack.trackContentId = "http://192.168.3.102:" +http.server.address().port + "/sub.vtt";
				cTrack.trackContentType = 'text/vtt';
				cTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
				cTrack.name = 'Subtitles';
				cTrack.language = 'en-US';
				cTrack.customData = null;

				mediaInfo.customData = null;
				mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
				mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
				mediaInfo.textTrackStyle.backgroundColor = '#00000000';
				mediaInfo.textTrackStyle.edgeColor = '#000000';
				mediaInfo.textTrackStyle.edgeType = chrome.cast.media.TextTrackEdgeType.SANS_SERIF;
				mediaInfo.textTrackStyle.fontGenericFamily = chrome.cast.media.TextTrackFontGenericFamily.SERIF;
				mediaInfo.textTrackStyle.fontScale = 1.2;
				mediaInfo.duration = null;
				mediaInfo.tracks = [cTrack];

				request.activeTrackIds = [1];
			}

			session.loadMedia(request, cast.onMediaDiscovered.bind(this, 'loadMedia'), cast.onMediaError);

		}, function (e)
		{
			console.log('error', e)
		});
	},
	onMediaDiscovered: function(how, media)
	{
		console.log('onMediaDiscovered');
		app.current_media_session = media;
	},
	onMediaError: function(e)
	{
		console.log('onMediaError', e);
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