(function(){
	'use strict';

	var $ = require('jquery'),
		Avatar = require('./avatar');

	var Intro = function($el, context, socket) {
		this.$el = $el;
		this.context = context;
		this.socket = socket;

		this.$el.on('click', $.proxy(this.enter, this));

		if (this.context === false) {
			this.notSupported();
			return;
		}


		this.avatarCreator = new Avatar(
			$('#webcam'),
			$('#buffer'),
			$('#avatar'),
			466, 350,
			this.context
		);

		$('#make-avatar').on('click', $.proxy(this.avatarCreator.makeAvatar, this.avatarCreator));
		$('#try-again').on('click', $.proxy(this.avatarCreator.tryAgain, this.avatarCreator));
		$('#ready-go').on('click', $.proxy(this.selectAvatar, this));


	};

	Intro.prototype.enter = function() {
		var self = this;
		$('#welcome').fadeOut(400, function(){
			$('#setup').fadeIn(400, function(){
				$('#buffer').removeClass('hidden');
			});
		});
	};

	Intro.prototype.notSupported = function() {
		$('#setup').html(
			'<h2 class="no-camera site-title sub">' +
				'Please use Chrome, Firefox or Opera' +
			'</h2>'
		);
	};

	Intro.prototype.selectAvatar = function() {
		var data = this.avatarCreator.selectAvatar();
		this.exit();
		this.socket.emit('user enter', data);
	};



	Intro.prototype.exit = function() {
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
	};


	module.exports = Intro;

}());
