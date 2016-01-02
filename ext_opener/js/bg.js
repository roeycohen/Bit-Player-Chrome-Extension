//var POPCORN_PLAYER_APP_ID = "icocmgpofpimcojhefbcfbdldkmndpgj";
var POPCORN_PLAYER_APP_ID = "lhjejncdphamohhgcjkeineeajmhmnoh"; //dev

function error(error)
{
	chrome.notifications.create("subtitles", {
			type: "basic",
			title: "Popcorn Player Launcher",
			iconUrl: "../images/icon64.png",
			message: error
		},
		function () // The callback is required before Chrome 42.
		{
		}
	);
}

chrome.contextMenus.onClicked.addListener(function (info)
{
	chrome.runtime.sendMessage(POPCORN_PLAYER_APP_ID, {
		command: 'open-torrent-url',
		url: info.linkUrl
	}, function (response)
	{
		if (undefined == response)
			return error('Please install Popcorn Player app!');

		if (response.result !== 1)
		{
			console.log(response);
			return error(result);
		}

		console.log('Torrent fetched successfully by Popcorn Player app.');
	})
});

chrome.runtime.onInstalled.addListener(function ()
{
	chrome.contextMenus.create({
		id: "contextMenu",
		title: "Play with Popcorn Player",
		contexts: ["link"],
		targetUrlPatterns: ["magnet:*",
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

