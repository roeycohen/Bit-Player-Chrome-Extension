;

controls = {
	hideControlsTimeout: null,
	video: null,
	$video: null,
	$ctrls: null,
	cue_style: null,
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
			if (e.target.files[0])
			{
				$('#status').hide();
				app.start_video_local(e.target.files[0]);
			}
		});
		$('#welcome #manual_video_file_button').click(function (e)
		{
			$('#welcome [name="manual_video_file"]:file').trigger('click');
		});

		controls.video.oncanplay = function ()
		{
			background.stop();
			$('#loader, #welcome, #help_link, #logo').slideUp();
			$('#player').slideDown();
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
			controls.cue_style.setProperty('font-size', size, null);
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
		//video click play/pause
		controls.$video.click(function ()
		{
			if (controls.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
				return;
			controls.video.paused ? controls.video.play() : video.pause();
		});

		//keyboard
		$(document).on('keydown', function (e)
		{
			if (controls.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
				return;

			switch (e.keyCode)
			{
				case 32: //space
					controls.video.paused ? controls.video.play() : video.pause();
					break;
				case 39: //right arrow
					controls.video.currentTime += 10;
					break;
				case 37: //left arrow
					controls.video.currentTime -= 10;
					break;
				case 38: //up arrow
					controls.video.currentTime += 60;
					break;
				case 40: //down arrow
					controls.video.currentTime -= 60;
					break;
			}
		});

		//progress bar
		controls.$video.on('timeupdate', function ()
		{
			$('#time').text(controls.seconds_to_hhmmss(controls.video.currentTime) + ' / ' + controls.seconds_to_hhmmss(controls.video.duration));
			$('#time_bar #percentage').css('width', (controls.video.currentTime * 100 / controls.video.duration) + '%');
		});
		controls.$ctrls.find('#time_bar').mouseup(function (e)
		{
			controls.video.currentTime = e.offsetX / $(this).width() * controls.video.duration;
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
			if (controls.video.readyState < 2) //http://www.w3schools.com/tags/av_prop_readystate.asp
				return;
			controls.video.paused ? controls.video.play() : video.pause();
			$(this).find('> span').attr('class', controls.video.paused ? 'icon-play3' : 'icon-pause2');
		});
		controls.$video.on('play pause', function ()
		{
			controls.$ctrls.find('#btn_play_pause > span').attr('class', controls.video.paused ? 'icon-play3' : 'icon-pause2');
		});

		//volume
		var last_vol = controls.video.volume;
		controls.$ctrls.find('#btn_mute').click(function ()
		{
			if (controls.video.volume > 0)
			{
				last_vol = controls.video.volume;
				controls.video.volume = 0;
			}
			else
			{
				controls.video.volume = last_vol;
			}
			controls.$ctrls.find('#volume_bar').val(controls.video.volume);
			controls.mute_icon();
		});
		controls.$ctrls.find('#volume_bar').change(function (e)
		{
			controls.video.volume = $(this).val();
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
	},
	controls_fill_sub: function (srts)
	{
		subs.prefered_sub_lang().then(function (prefered_sub_lang)
		{
			var $srt_li_to_load = null;
			var $cm = controls.$ctrls.find('#available_subs').html('');
			$.each(srts, function (i, srt)
			{
				if (i === 0)
				{
					document.title = srt.MovieName + ' - Bit Player';
					$('#window_title').html(document.title);
				}

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
		var vol = controls.video.volume;
		var $icon_span = controls.$ctrls.find('#btn_mute > span');
		if (vol == 0)
			$icon_span.attr('class', 'icon-volume-mute2');
		else if (vol > 0.66)
			$icon_span.attr('class', 'icon-volume-high');
		else if (vol > 0.3)
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
		var cur_size = parseFloat(controls.cue_style.getPropertyValue('font-size'));
		var new_size = (cur_size + (increase ? 0.1 : -0.1) + 'em');
		controls.cue_style.setProperty('font-size', new_size, null);
		subs.subtitles_size(new_size);
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