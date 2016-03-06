background = {
	timer: null,
	cur_image: 0,
	entry: function ()
	{
		this.get_posters().then(function (posters)
		{
			background.set_posters(posters);
			background.timer = setInterval(function ()
			{
				background.set_posters(posters);
			}, 10000)
		});
	},
	stop: function ()
	{
		$('#background > table').hide();
		if (background.timer)
			clearInterval(background.timer);
	},
	set_posters: function (posters)
	{
		for (var i = 0; i < 6; i++)
		{
			(function (pnum, pos)
			{
				background.get_image(posters[pos].images.poster.thumb).then(function (src_url)
				{
					var $img = $('[pnum="' + pnum + '"]');
					var old_url = $img.data('src');
					if (old_url)
					{
						URL.revokeObjectURL(old_url);
					}
					$img.data('src', src_url).css('background-image', 'url(' + src_url + ')');
				});

			})(i, background.cur_image);

			background.cur_image++;
			if (background.cur_image >= posters.length)
				background.cur_image = 0;
		}
	},
	get_image: function (url)
	{
		return new Promise(function (resolve, reject)
		{
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.onload = function ()
			{
				resolve(URL.createObjectURL(xhr.response));
			};
			xhr.send();
		});
	},
	get_posters: function ()
	{
		return new Promise(function (resolve, reject)
		{
			var shuffle = function (o)
			{
				for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
				return o;
			};

			$.ajax('https://api-v2launch.trakt.tv/movies/popular?extended=images&limit=200', {
				headers: {
					'trakt-api-version': '2',
					'trakt-api-key': 'c7e20abc718e46fc75399dd6688afca9ac83cd4519c9cb1fba862b37b8640e89'
				},
				success: function (res)
				{
					resolve(shuffle(res));
				}
			});
		});

	}
};