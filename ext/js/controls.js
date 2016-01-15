;

controls = {
	hideControlsTimeout: null,
	video: null,
	$video: null,
	$ctrls: null,
	init: function ()
	{
		controls.video = document.getElementById("video");
		controls.$video = $(controls.video);
		controls.$ctrls = $('#controls');

		$(window).resize(function ()
		{
			controls.$video.css('width', $(window).width());
			controls.$video.css('height', $(window).height());
		}).trigger('resize');

		$('#welcome input').on('change keyup keydown', function ()
		{
			var url = $(this).val();
			if (url.match(/^magnet:*/))
				app.start_video(url);
			else
				$(this).val('');
		});
		controls.video.oncanplay = function ()
		{
			background.stop();
			$('#loader, #help_link').slideUp();
			$('#player').slideDown();
		};

		//mouse play/pause
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

		controls.$video.on('playing play waiting pause mousemove', function ()
		{
			controls.toggle_controls(true);
		});

		//subtitles
		var cue_style = document.getElementById('subs_style').sheet.cssRules[0].style;
		var set_font_size = function (increase)
		{
			var cur_size = parseFloat(cue_style.getPropertyValue('font-size'));
			var new_size = (cur_size + (increase ? 0.1 : -0.1) + 'em');
			cue_style.setProperty('font-size', new_size, null);
			chrome.storage.local.set({subtitles_size: new_size});
		};

		chrome.storage.local.get('subtitles_size', function (data)
		{
			if ('subtitles_size' in data)
				cue_style.setProperty('font-size', data['subtitles_size'], null);
		});

		controls.$ctrls.find('#plus').click(function ()
		{
			set_font_size(true);
		});
		controls.$ctrls.find('#minus').click(function ()
		{
			set_font_size(false);
		});
		controls.$ctrls.find('#sub_select .context_menu').on('click', 'li', function ()
		{
			var $li = $(this);
			if ($li.hasClass('manual'))
			{
				$('[name="manual_subtitles_file"]:file').trigger('click');
			}
			else
			{
				$li.siblings().removeClass('active');
				$li.addClass('active');

				var sub_data = $li.data();
				chrome.storage.local.set({prefered_sub_lang: sub_data.language || null}); //assuming the user will always use the same subtitles language...
				subs.set_srt(controls.video, sub_data.sub_id, sub_data.encoding);
			}
		});
		$('[name="manual_subtitles_file"]:file').change(function (e)
		{
			if (e.target.files[0])
			{
				controls.$ctrls.find('#sub_select .context_menu li').removeClass('active').filter('.manual').addClass('active');
				subs.set_srt(controls.video, 'manual', null, e.target.files[0]);
				e.target.value = ''; //make sure the change event will trigger if the user chooses the previous file again
			}
		});
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
	controls_fill_sub: function (srts)
	{
		chrome.storage.local.get(['prefered_sub_lang'], function (data)
		{
			var $srt_li_to_load = null;
			var $cm = controls.$ctrls.find('#sub_select').find('.context_menu');
			$.each(srts, function (i, srt)
			{
				if (i === 0)
					document.title = srt.MovieName + ' - Bit Player';

				var $li = $('<li></li>').text(srt.MovieReleaseName + ' (' + srt.LanguageName + ')').data({
					sub_id: srt.IDSubtitleFile,
					language: srt.SubLanguageID,
					encoding: srt.SubEncoding
				});

				$cm.append($li);

				if (!$srt_li_to_load && data.prefered_sub_lang === srt.SubLanguageID)
					$srt_li_to_load = $li;
			});
			$srt_li_to_load && $srt_li_to_load.trigger('click');
		})
	}
};