(function(){
	'use strict';

    var $ = require('jquery');

	var Room = function($el, socket) {
		this.$el = $el;
		this.socket = socket;

		this.$el.on('click', $.proxy(this.onClickMove, this));
		$('.smoke-signs').on('mouseover', this.stopShaking);
	};

	Room.prototype.stopShaking = function() {
		$(this).removeClass('shake');
		$('#smoke-alert').show();

		setTimeout(function() {
			$('#smoke-alert').remove();
		}, 5000);
	};

	Room.prototype.onClickMove = function(e) {
		if(e.target !== this.$el[0]) return;
		e.preventDefault();
		e.stopPropagation();

		var $avatar = $('.current-user'),
			m_x = e.clientX - 150,
			m_y = e.clientY - 210;

		$avatar.css({
			'left'	: m_x,
			'top'	: m_y
		});

		this.socket.socket.emit('user move', { username: this.socket.user.name, new_pos: [m_x, m_y]});
	};

	$(document).on('click', '.chat-hide', function(){
		$(this).parents('.chat-window').toggleClass('hidden');
		if ($(this).text() === 'Hide') {
			$(this).text('Show');
		} else {
			$(this).text('Hide');
		}
	});

	$(document).on('click', '.pv', function(){
		$(this).siblings('#collabs').toggleClass('show');
	});

	$(document).on('click', '#like', function(){
		$(this).hide();
		$(this).siblings().show();
	});

	setTimeout(function(){
		$('#facebook.box').css({
			'left' 	: Math.random() * ($(window).width() - 200),
			'top'	: Math.random() * ($(window).height() - 300)
		}).show();

			setTimeout(function(){
				$('#facebook.box').hide();
			}, 30000);

	}, 120000);



	module.exports = Room;

}());




