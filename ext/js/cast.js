;
var cast = {
	available: false,
	current_media_session: false,
	entry: function ()
	{
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

			session.addMediaListener(cast.onMediaDiscovered.bind(this, 'addMediaListener'));

			var mediaInfo = new chrome.cast.media.MediaInfo(cast.url);
			mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
			mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
			mediaInfo.contentType = 'video/mp4';

			var request = new chrome.cast.media.LoadRequest(mediaInfo);
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
				console.dir(e);
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
			console.log(interfaces);
		});
	}
};