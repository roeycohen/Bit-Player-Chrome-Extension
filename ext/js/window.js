;
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
	$('#available_subs').niceScroll({
		autohidemode: "leave",
		cursorcolor: "#434343",
		cursorborder: "1px solid #999"
	});
	$('#btn-always_on_top').click(function ()
	{
		$(this).toggleClass('active');
		win.setAlwaysOnTop($(this).hasClass('active'));
	});

	// context menu handling
	$('.button:has(> .context_menu), li:has(> .context_menu)').hover(function ()
	{
		//in
		if (this.menu_timeout)
		{
			clearTimeout(this.menu_timeout);
			this.menu_timeout = null;
		}
		$(this).find('> .context_menu').show();
	}, function ()
	{
		//out
		var _this = this;
		_this.menu_timeout = setTimeout(function ()
		{
			$(_this).find('> .context_menu').hide();
			clearTimeout(_this.menu_timeout);
			_this.menu_timeout = null;
		}, 1000);
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