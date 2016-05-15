;

controls = {
	hideControlsTimeout: null,
	video: null,
	$video: null,
	$ctrls: null,
	cue_style: null,
	subtitles_size: 1,
	subtitles_size_cast: 1,
	init: function ()
	{
		controls.video = document.getElementById("video");
		controls.$video = $(controls.video);
		controls.$ctrls = $('#controls');

		$(window).resize(function ()
		{
			controls.$video.css('width', $('#main_area').width());
			controls.$video.css('height', $('#main_area').height());
		}).trigger('resize');

		$('#welcome input[name="magnet_url"]').on('change keyup keydown', function ()
		{
			var url = $(this).val();
			if (url.match(/^magnet:*/))
				app.start_video(url);
			else
				$(this).val('');
		});

		$('#welcome [name="manual_video_file"]:file').change(function (e)
		{
			var f = e.target.files[0];
			if (f)
			{
				if (f.type === 'application/x-bittorrent' || app.file_extension(f.name).toLowerCase() === 'torrent')
				{
					var fileReader = new FileReader();
					fileReader.onload = function (e)
					{
						app.start_video(torrent.typedarrayToBuffer(new Uint8Array(e.target.result)));
					};
					fileReader.readAsArrayBuffer(f);
				}
				else
				{
					$('#status').hide();
					app.start_video_local(f);
				}
			}
		});
		$('#welcome #manual_video_file_button').click(function (e)
		{
			$('#welcome [name="manual_video_file"]:file').trigger('click');
		});

		//auto start
		var $cb_autostart = $('#loader [name="auto_start"]:checkbox');
		$cb_autostart.change(function()
		{
			chrome.storage.local.set({auto_start: $(this).is(':checked')});
		});
		chrome.storage.local.get('auto_start', function (data)
		{
			$cb_autostart.prop('checked', data['auto_start']);
		});

		controls.video.oncanplay = function ()
		{
			background.stop();
			$('#loader, #welcome, #help_link, #logo').slideUp();
			$('#player').slideDown();

			if (app.torrent_fetch_success && $cb_autostart.is(':checked'))
				controls.$ctrls.find('#btn_play_pause').trigger('click');
		};

		controls.$video.on('playing play waiting pause mousemove', function ()
		{
			controls.toggle_controls(true);
		});

		controls.fill_languages();

		//subtitles font size
		controls.cue_style = document.getElementById('subs_style').sheet.cssRules[0].style;
		subs.subtitles_size().then(function (size)
		{
			controls.cue_style.setProperty('font-size', size + 'em', null);
		});
		subs.subtitles_size_cast().then(function (size)
		{
			controls.subtitles_size_cast = size;
		});

		controls.controls_handlers();
	},
	toggle_controls: function (on)
	{
		if (true === on)
		{
			$('#status').css('opacity', 1);
			controls.$ctrls.show();
			controls.$video.css({cursor: 'default'});

			controls.hideControlsTimeout && clearTimeout(controls.hideControlsTimeout);
			if (!controls.video.paused)
			{
				controls.hideControlsTimeout = window.setTimeout(function ()
				{
					controls.toggle_controls(false);
				}, 3000);
			}
		}
		else
		{
			$('#status').css('opacity', 0);
			controls.$ctrls.hide();
			controls.$video.css({cursor: 'none'});
		}
	},
	controls_handlers: function ()
	{
		function seek_relative(span)
		{
			if (cast.session)
			{
				if (cast.media)
				{
					var request = new chrome.cast.media.SeekRequest();
					request.currentTime = cast.media.getEstimatedTime() + span;
					cast.media.seek(request);
				}
			}
			else
			{
				if (controls.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
					return;
				controls.video.currentTime += span;
			}
		}

		//keyboard
		$(document).on('keydown', function (e)
		{
			switch (e.keyCode)
			{
				case 32: //space
					controls.$ctrls.find('#btn_play_pause').trigger('click');
					break;
				case 39: //right arrow
					seek_relative(10);
					break;
				case 37: //left arrow
					seek_relative(-10);
					break;
				case 38: //up arrow
					seek_relative(60);
					break;
				case 40: //down arrow
					seek_relative(-60);
					break;
			}
		});

		//progress bar
		controls.$video.on('timeupdate', function ()
		{
			controls.$ctrls.find('#time').text(controls.seconds_to_hhmmss(controls.video.currentTime) + ' / ' + controls.seconds_to_hhmmss(controls.video.duration));
			controls.$ctrls.find('#time_bar #percentage').css('width', (controls.video.currentTime * 100 / controls.video.duration) + '%');
		});
		controls.$ctrls.find('#time_bar').mouseup(function (e)
		{
			var new_time = e.offsetX / $(this).width() * controls.video.duration;
			if (cast.session)
			{
				if (cast.media)
				{
					var request = new chrome.cast.media.SeekRequest();
					request.currentTime = new_time;
					cast.media.seek(request);
				}
			}
			else
				controls.video.currentTime = new_time;
		});
		controls.$ctrls.find('#time_bar').mousemove(function (e)
		{
			$('#time_bar #goto').css('width', (e.offsetX * 100 / $(this).width()) + '%');
		});
		controls.$video.on('durationchange', function ()
		{
			$('#time').text(controls.seconds_to_hhmmss(controls.video.currentTime) + ' / ' + controls.seconds_to_hhmmss(controls.video.duration));
		});
		controls.$video.on('progress', function ()
		{
			var $bg_bar = $('#time_bar #bg');
			$bg_bar.html('');
			for (var i = 0; i < controls.video.buffered.length; i++)
			{
				$bg_bar.append(
					$('<div></div>').css({
						left: (controls.video.buffered.start(i) * 100 / controls.video.duration) + '%',
						width: ((controls.video.buffered.end(i) - controls.video.buffered.start(i)) * 100 / controls.video.duration) + '%'
					})
				);
			}
		});

		//pause/play button
		controls.$ctrls.find('#btn_play_pause').click(function ()
		{
			if (cast.session)
			{
				if (cast.media)
				{
					if (cast.media.playerState === "PLAYING")
						cast.media.pause();
					else
						cast.media.play();
				}
			}
			else
			{
				if (controls.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
					return;
				controls.video.paused ? controls.video.play() : controls.video.pause();
			}
		});
		//video click play/pause
		$('#video, #casting_bg').click(function ()
		{
			controls.$ctrls.find('#btn_play_pause').trigger('click');
		});
		controls.$video.on('play pause', function ()
		{
			controls.$ctrls.find('#btn_play_pause > span').attr('class', controls.video.paused ? 'icon-play3' : 'icon-pause2');
		});

		//volume
		controls.$ctrls.find('#btn_mute').click(function ()
		{
			if (cast.session)
				cast.session.setReceiverMuted(!cast.session.receiver.volume.muted);
			else
				controls.video.muted = !controls.video.muted;

			controls.mute_icon();
		});
		controls.$ctrls.find('#volume_bar').change(function ()
		{
			var new_vol = parseFloat($(this).val());
			if (cast.session)
			{
				cast.session.setReceiverVolumeLevel(new_vol);
				if (cast.session.receiver.volume.muted)
					cast.session.setReceiverMuted(false);
			}
			else
			{
				controls.video.volume = new_vol;
				controls.video.muted = false;
			}

			controls.mute_icon();
		}).val(controls.video.volume);

		//full screen
		controls.$ctrls.find('#btn_full_screen').click(function ()
		{
			if (document.webkitFullscreenElement)
				document.webkitExitFullscreen();
			else
				controls.video.webkitRequestFullScreen();
		});
		$(document).on('webkitfullscreenchange', function (e)
		{
			$('#btn_full_screen > span').attr('class', document.webkitIsFullScreen ? 'icon-shrink2' : 'icon-enlarge2');
		});

		//subtitles
		controls.$ctrls.find('#btn_plus').click(function ()
		{
			controls.set_font_size(true);
		});
		controls.$ctrls.find('#btn_minus').click(function ()
		{
			controls.set_font_size(false);
		});
		controls.$ctrls.find('#btn_sub_select .context_menu').on('click', 'li:not(.lang_select_menu)', function ()
		{
			var $li = $(this);
			if ($li.hasClass('manual'))
			{
				$('[name="manual_subtitles_file"]:file').trigger('click');
			}
			else
			{
				$('#btn_sub_select li').removeClass('active');
				$li.addClass('active');

				var sub_data = $li.data();
				subs.prefered_sub_lang(sub_data.language || null); //assuming the user will always use the same subtitles language...
				subs.set_srt(controls.video, sub_data.sub_id, sub_data.encoding);
			}
		});
		$('[name="manual_subtitles_file"]:file').change(function (e)
		{
			if (e.target.files[0])
			{
				controls.$ctrls.find('#btn_sub_select .context_menu li').removeClass('active').filter('.manual').addClass('active');
				subs.set_srt(controls.video, 'manual', null, e.target.files[0]);
				e.target.value = ''; //make sure the change event will trigger if the user chooses the previous file again
			}
		});

		controls.$ctrls.find('#btn_cast').click(function ()
		{
			controls.video.pause();
			cast.start();
		});
	},
	cast_progress_timer: null,
	cast_time: null,
	cast_media_update: function (isAlive)
	{
		if (!isAlive)
			return;

		controls.$ctrls.find('#btn_play_pause > span').attr('class', cast.media.playerState === "PLAYING" ? 'icon-pause2' : 'icon-play3');

		if (cast.media.playerState === "PLAYING")
		{
			if (controls.cast_progress_timer)
				return;

			controls.cast_progress_timer = setInterval(function ()
			{
				if (!cast.media)
				{
					clearInterval(controls.cast_progress_timer);
					controls.cast_progress_timer = null;
					return;
				}

				controls.cast_time = cast.media.getEstimatedTime();
				controls.$ctrls.find('#time').text(controls.seconds_to_hhmmss(controls.cast_time) + ' / ' + controls.seconds_to_hhmmss(cast.media.media.duration));
				controls.$ctrls.find('#time_bar #percentage').css('width', (controls.cast_time * 100 / cast.media.media.duration) + '%');
			}, 1000);
		}
		else
		{
			clearInterval(controls.cast_progress_timer);
			controls.cast_progress_timer = null;
		}
	},
	cast_session_update: function (isAlive)
	{
		if (!isAlive)
		{
			//restore time control
			if (controls.cast_time)
				controls.video.currentTime = controls.cast_time;

			//restore volume controls
			controls.$ctrls.find('#volume_bar').val(controls.video.volume);
		}
		else
		{
			controls.$ctrls.find('#volume_bar').val(cast.session.receiver.volume.level);
		}
		controls.mute_icon();
	},
	cast_available: function(is_available)
	{
		controls.$ctrls.find('#btn_cast').toggle(is_available);
		$('#welcome .icon-google127').css('color', is_available ? '#3ab797' : '');
	},
	controls_fill_sub: function (srts)
	{
		subs.prefered_sub_lang().then(function (prefered_sub_lang)
		{
			var $srt_li_to_load = null;
			var $cm = controls.$ctrls.find('#available_subs').html('');
			$.each(srts, function (i, srt)
			{
				var $li = $('<li></li>').text(srt.MovieReleaseName + ' (' + srt.LanguageName + ')').data({
					sub_id: srt.IDSubtitleFile,
					language: srt.SubLanguageID,
					encoding: srt.SubEncoding
				});

				$cm.append($li);

				if (!$srt_li_to_load && prefered_sub_lang === srt.SubLanguageID)
					$srt_li_to_load = $li;
			});
			$srt_li_to_load && $srt_li_to_load.trigger('click');
		});
	},
	mute_icon: function ()
	{
		var vol, muted;
		if (cast.session)
		{
			vol = cast.session.receiver.volume.level;
			muted = cast.session.receiver.volume.muted;
		}
		else
		{
			vol = controls.video.volume;
			muted = controls.video.muted;
		}

		var $icon_span = controls.$ctrls.find('#btn_mute > span');
		if (muted)
			$icon_span.attr('class', 'icon-volume-mute2');
		else if (vol == 0)
			$icon_span.attr('class', 'icon-volume-mute');
		else if (vol > 0.66)
			$icon_span.attr('class', 'icon-volume-high');
		else if (vol > 0.33)
			$icon_span.attr('class', 'icon-volume-medium');
		else
			$icon_span.attr('class', 'icon-volume-low');
	},
	seconds_to_hhmmss: function (totalSeconds)
	{
		var hours = Math.floor(totalSeconds / 3600);
		var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
		var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
		seconds = seconds.toFixed(0);

		var result = hours ? (hours < 10 ? "0" + hours : hours) + ':' : '';
		result += (minutes < 10 ? "0" + minutes : minutes);
		result += ":" + (seconds < 10 ? "0" + seconds : seconds);
		return result;
	},
	set_font_size: function (increase)
	{
		if (cast.session)
		{
			if (cast.media)
			{
				controls.subtitles_size_cast = Math.min(Math.max(controls.subtitles_size_cast + (increase ? 0.1 : -0.1), 0.5), 3); //keeping size between 0.5 and 3
				subs.subtitles_size_cast(controls.subtitles_size_cast);

				cast.media.editTracksInfo(new chrome.cast.media.EditTracksInfoRequest(null, cast.sub_style(controls.subtitles_size_cast)));
			}
		}
		else
		{
			controls.subtitles_size = Math.min(Math.max(controls.subtitles_size + (increase ? 0.1 : -0.1), 0.5), 3); //keeping size between 0.5 and 3
			subs.subtitles_size(controls.subtitles_size);

			controls.cue_style.setProperty('font-size', controls.subtitles_size + 'em', null);
		}
	},
	fill_languages: function ()
	{
		subs.users_languages().then(function(users_languages)
		{
			var $lsm = $('#lang_select_table');
			var $tr;
			$.each(subs.lang_ids, function (i, l)
			{
				if (0 === i % 5)
					$lsm.append($tr = $('<tr></tr>'));

				$tr.append(
					$('<td></td>').append(
						$('<label></label>').append(
							$('<input type="checkbox" name="lng_id[]"/>').val(l.SubLanguageID).prop('checked', -1 < $.inArray(l.SubLanguageID, users_languages)).prop('disabled', l.SubLanguageID === 'eng'),
							l.LanguageName
						)
					)
				);
			});

			$lsm.on('change', ':checkbox', function ()
			{
				//set selected languages
				subs.users_languages(
					$lsm.find(':checkbox:checked:enabled').map(function ()
					{
						return $(this).val();
					}).get()
				);
			});
		});

	}
};