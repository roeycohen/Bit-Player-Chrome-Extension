;
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex)
{
	if (notificationId === 'wrong_extension')
		window.open('http://www.omgchrome.com/cast-chrome-tab-to-tv-no-extension/');
});

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

	//language table positioning
	$('#lang_select_table').hover(function ()
	{
		var $lsm = $(this);
		var left = $lsm.offset().left;
		if (left < 0)
			$lsm.css({'margin-right': -Math.min($('.lang_select_menu').outerWidth() - 40, Math.abs(left)) + 'px'});
	}, function ()
	{
		$(this).css({'margin-right': ''});
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