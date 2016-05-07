;
//https://developers.google.com/cast/docs/chrome_sender
var cast = {
	session: null,
	media: null,
	url: null,
	poster_set: false,
	cast_available: false,
	devices: {},
	only_ip: null,
	supported_cast_extensions: [
		'fjhoaacokmgbjemoflkofnenfaiekifl', //v48
		'pkedcjkdefgpdelpbcmbmeomcjbeemfm' //v49
	],
	entry: function ()
	{
		cast.scan_devices();

		window['__onGCastApiAvailable'] = function (loaded, errorInfo)
		{
			if (loaded)
				cast.initialize_cast_api();
		};
	},
	initialize_cast_api: function ()
	{
		//enable cast only for users who enabled the new cast extension
		//todo: remove this in the final version
		if (cast.supported_cast_extensions.indexOf(chrome.cast.extensionId) < 0)
			return;

		$('#cast_beta_text').show();

		var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
			function (e)
			{
				//sessionListener
			}, function (e)
			{
				//cast.cast_available = e === chrome.cast.ReceiverAvailability.AVAILABLE;
			});
		chrome.cast.initialize(apiConfig, function ()
		{
			cast.cast_available = true;
			controls.cast_available(cast.only_ip || Object.keys(cast.devices).length > 0);
		}, function (cc_error)
		{
			console.log('cc_error', cc_error);
		});
	},
	start: function ()
	{
		if (cast.supported_cast_extensions.indexOf(chrome.cast.extensionId) < 0)
			return app.error('Seems like you have chrome cast.\nIn order to use it with this app, you must enable the "Media router" flag in your browser.', 'wrong_extension', [{title: 'Click HERE for more details.'}]);

		var port = http.server.address().port;
		if (port != http.DEFAULT_PORT)
			app.error('Port ' + http.DEFAULT_PORT + ' is already in use, cast will probably fail.\nPort ' + port + ' is in use instead.');

		chrome.cast.requestSession(function (session)
		{
			chrome.power.requestKeepAwake('system');

			$('#casting_bg').show();
			cast.set_sender_poster();

			cast.session = session;
			cast.session.addUpdateListener(cast.session_listener);

			cast.load_media();

		}, function ()
		{
		});
	},
	load_media: function ()
	{
		if (!cast.session)
			return;

		var ip;
		if (cast.only_ip)
			ip = cast.only_ip;
		else
		{
			var selected_device = cast.devices[cast.session.receiver.friendlyName];
			if (!selected_device)
				return app.error('selected device was not found by app.');
			ip = selected_device.reachable_machine_ips[0];
		}

		var start_time = controls.video.currentTime;
		if (cast.media)
		{
			start_time = cast.media.getEstimatedTime();
			//cast.media.stop();
			cast.media.removeUpdateListener(cast.media_listener);
			cast.media = null;
		}

		var url = "http://" + ip + ":" + http.server.address().port + "/" + http.file.name;
		console.log(url);

		//media info
		var mediaInfo = new chrome.cast.media.MediaInfo(url);
		mediaInfo.contentType = 'video/mp4';
		mediaInfo.customData = null;
		mediaInfo.duration = null;
		mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;

		//meta data
		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
		if (app.video_name)
			mediaInfo.metadata.title = app.video_name;
		if (app.trakt_info && app.trakt_info[0] && app.trakt_info[0].show && app.trakt_info[0].show.images && app.trakt_info[0].show.images.fanart)
		{
			var fanart = app.trakt_info[0].show.images.fanart;
			var sel_art = fanart.medium || fanart.full || fanart.thumb;
			if (sel_art)
				mediaInfo.metadata.images = [{url: sel_art}];
		}

		//request
		var request = new chrome.cast.media.LoadRequest(mediaInfo);
		request.currentTime = start_time;

		//subtitles
		if (http.sub)
		{
			var cTrack = new chrome.cast.media.Track(1, chrome.cast.media.TrackType.TEXT);
			cTrack.trackContentId = "http://" + ip + ":" + http.server.address().port + "/sub.vtt";
			cTrack.trackContentType = 'text/vtt';
			cTrack.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
			cTrack.name = 'Subtitles';
			cTrack.language = 'en-US';

			mediaInfo.textTrackStyle = cast.sub_style();
			mediaInfo.tracks = [cTrack];

			request.activeTrackIds = [1];
		}

		var send_request = function ()
		{
			cast.session.loadMedia(request, function (media)
			{
				cast.media = media;
				media.addUpdateListener(cast.media_listener);
			}, cast.onMediaError);
		};

		if (http.sub && !http.sub.ready)
			http.sub.onReady = send_request;
		else
			send_request();
	},
	session_listener: function (isAlive)
	{
		if (!isAlive)
		{
			chrome.power.releaseKeepAwake();

			if (cast.session)
			{
				cast.session.removeUpdateListener(cast.session_listener);
				cast.session = null;
			}
			cast.session = null;
			if (cast.media)
			{
				cast.media.removeUpdateListener(cast.media_listener);
				cast.media = null;
			}

			$('#casting_bg').hide();
		}
		controls.cast_session_update(isAlive);
	},
	media_listener: function (isAlive)
	{
		controls.cast_media_update(isAlive);
	},
	onMediaError: function (e)
	{
		console.log('onMediaError', e);
	},
	set_sender_poster: function ()
	{
		try
		{
			//download poster only if cast is active
			if (!cast.poster_set && app.trakt_info && $('#casting_bg').is(':visible'))
			{
				cast.poster_set = true;
				background.get_image(app.trakt_info[0].show.images.fanart.medium).then(function (src_url)
				{
					$('#casting_bg').css('background-image', 'url("' + src_url + '")');
				});
			}
		}
		catch (e)
		{
		}
	},
	// ======================================================================
	sub_style: function (font_scale)
	{
		if (!font_scale)
			font_scale = controls.subtitles_size_cast;

		var tts = new chrome.cast.media.TextTrackStyle();
		tts.backgroundColor = '#00000000';
		tts.edgeColor = '#000000cc';
		tts.edgeType = chrome.cast.media.TextTrackEdgeType.OUTLINE;
		tts.fontGenericFamily = chrome.cast.media.TextTrackFontGenericFamily.SANS_SERIF;
		tts.fontScale = font_scale;

		return tts;
	},
	scan_devices: function ()
	{
		var calc_network = function (address, prefixLength)
		{
			var c = address.split(".");
			var ipnum = parseInt(c[0], 10) << 24 | parseInt(c[1], 10) << 16 | parseInt(c[2], 10) << 8 | parseInt(c[3], 10);
			var mask = -1 << 32 - prefixLength;
			return ipnum & mask;
		};

		chrome.system.network.getNetworkInterfaces(function (interfaces)
		{
			var self_ips = $.map(interfaces, function (intf)
			{
				if (!!intf.address.match(/^\d+\.\d+\.\d+\.\d+$/))
				{
					intf.network = calc_network(intf.address, intf.prefixLength);
					return intf;
				}
			});

			if (self_ips.length == 1)
			{
				cast.only_ip = self_ips[0].address;
				controls.cast_available(cast.cast_available);
				return;
			}

			chrome.mdns.onServiceList.addListener(
				function (services)
				{
					$.each(services, function (i, s)
					{
						var friendly_name = false;
						$.each(s.serviceData, function (i, sd)
						{
							var fn_match = sd.match(/^fn=(.*)$/);
							if (fn_match)
								friendly_name = fn_match[1];
						});

						if (!friendly_name)
							return; //chrome devices should have a friendly name...

						if (friendly_name in cast.devices)
							return; //device already found

						s.reachable_machine_ips = [];
						$.each(self_ips, function (j, intf)
						{
							if (intf.network === calc_network(s.ipAddress, intf.prefixLength))
								s.reachable_machine_ips.push(intf.address);
						});
						if (s.reachable_machine_ips.length < 1)
							return; //reachable devices should be reachable from one of the local interface...

						cast.devices[friendly_name] = s;
					});

					controls.cast_available(cast.cast_available && Object.keys(cast.devices).length > 0);
				},
				{
					'serviceType': '_googlecast._tcp.local'
				}
			);
			chrome.mdns.forceDiscovery(function ()
			{
			});
		});
	}
};