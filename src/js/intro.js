(function(){
	'use strict';

	var $ = require('jquery');

	var Intro = function($el, context) {
		this.$el = $el;
		this.context = context;

		this.$el.on('click', this.enter);

		if (this.context === false) {
			this.notSupported();
			return;
		}

	};

	Intro.prototype.enter = function() {
		$('#welcome').fadeOut(400, function(){
			$('#setup').fadeIn(400);
		});
	};

	Intro.prototype.notSupported = function() {
		$('#setup').html('<h2 class="no-camera site-title sub">Please use Chrome, Firefox or Opera</h2>');
	};

	module.exports = Intro;





	var $readyBtn = $('#ready-go');

	$readyBtn.click(function(){
		var avatar = App.avatar,
			username = $('#username').val(),
			x = Math.random() * 1000,
			y = Math.random() * (window.innerHeight - 420);
		var data = {
			'avatar' : avatar,
			'username' : escapeHTML(username),
			'pos' : [x,y]
		};

		if (!avatar || !username === null) {
			window.alert('fill in your username and take a selfie, plz');
			return false;
		}

		App.stream.stop();
		App.stopped = true;
		sockets.socket.emit('user enter', data);
		$('#intro').animate(
			{'bottom': -1000},
			1500,
			function(){
				$('#room').removeClass('blur');
				$('#intro').height(0).width(0);
				$('#buffer').remove();
				$('.smoke-signs').addClass('shake');
			}
		);

	});

}());
