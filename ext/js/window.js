;
cast.entry();
window.onload = function ()
{
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
	$('#cast').click(function ()
	{
		cast.load_media();
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