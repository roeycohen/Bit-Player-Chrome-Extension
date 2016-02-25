;
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex)
{
	if (notificationId === 'wrong_extension')
		window.open('http://www.omgchrome.com/cast-chrome-tab-to-tv-no-extension/');
});

window.onload = function ()
{
	/*
	var modules = {};
	for (var key in window.browserify)
	{
		var m = window.browserify[key];
		$.extend(modules,m[1]);
	}
	console.log(modules);

	for (var key in window.browserify)
	{
		var m = window.browserify[key];
		if (m[0].toString() != "function (require,module,exports){\n\n}")
			continue;
		//if (Object.keys(m[1]).length === 0)
		{
			var found = false;
			for (var i in modules)
			{
				if (modules[i] == key)
				{
					console.log(key, i);
					found = true;
				}
			}
			if (!found)
				console.log(key, 'no usage?');
		}
	}

	return;
	*/
	var win = chrome.app.window.current();
	$('#btn-close').click(function ()
	{
		win.close();
	});
	$('#btn-maximize').click(function ()
	{
		if (win.isMaximized())
			win.restore();
		else
			win.maximize();
	});
	$('#btn-minimize').click(function ()
	{
		win.minimize();
	});
	var options = {};
	(location.href.split("?")[1] || "").split("&").map(function (t)
	{
		return t.split("=")
	}).forEach(function (t)
	{
		options[t[0]] = decodeURIComponent(t[1])
	});

	chrome.storage.local.debug = options.debug;

	app.entry(options.url);
};