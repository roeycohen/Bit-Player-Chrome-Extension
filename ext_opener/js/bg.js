var BIT_PLAYER_APP_ID = "mjkikpbeengfefopcnmhljmiobkghfpd";
//var BIT_PLAYER_APP_ID = "lhjejncdphamohhgcjkeineeajmhmnoh"; //dev

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex)
{
	window.open('https://chrome.google.com/webstore/detail/bit-player/mjkikpbeengfefopcnmhljmiobkghfpd');
});

function error(error, buttons)
{
	chrome.notifications.create("app_error", {
			type: "basic",
			title: "Bit Player Launcher",
			iconUrl: "../images/icon64.png",
			message: error,
			buttons: buttons || []
		},
		function () // The callback is required before Chrome 42.
		{
		}
	);
}

chrome.contextMenus.onClicked.addListener(function (info)
{
	chrome.runtime.sendMessage(BIT_PLAYER_APP_ID, {
		command: 'open-torrent-url',
		url: info.linkUrl
	}, function (response)
	{
		if (undefined == response)
			return error('The Bit Player app is missing.', [{title: 'Click HERE to install it.'}]);

		if (response.result !== 1)
		{
			console.log(response);
			return error(result);
		}

		console.log('Torrent fetched successfully by Bit Player app.');
	})
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		id: "contextMenu",
		title: "Play with Bit Player",
		contexts: ["link"],
		targetUrlPatterns: [
			"magnet:*",
			"*://*/*.torrent",
			"*://*/*.torrent?*",
			"*://*/*.torrent#*"
		]
	}, function ()
	{
	});
});

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse)
{
	sendResponse({
		installed: true,
		version: chrome.runtime.getManifest().version
	});
});

