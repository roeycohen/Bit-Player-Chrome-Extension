module.exports = {
	"lookup": function (hostname, options, callback)
	{
		if ("function" == typeof options && !callback)
			return module.exports.lookup(hostname, null, options);

		switch (hostname)
		{
			case 'router.bittorrent.com':
				return callback(null, '67.215.246.10', 4);
			case 'router.utorrent.com':
				return callback(null, '82.221.103.244', 4);
			case 'dht.transmissionbt.com':
				return callback(null, '91.121.59.153', 4); //212.129.33.50
		}
	}
};