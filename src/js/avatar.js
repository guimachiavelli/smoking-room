(function(){
	'use strict';

	var $ = require('jquery'),
		face = require('face-detect'),
		ccv = require('ccv'),
		utils = require('./utils');

	var Avatar = function($el, $canvas, $avatar, width, height, context) {
		this.$el = $el;
		this.$streamCanvas = $canvas;
		this.$avatarCanvas = $avatar;
		this.width = width;
		this.height = height;
		this.context = context;

		if (!this.context) {
			return;
		}

		this.$makeButton = $('#make-avatar');
		this.$tryAgainButton = $('#try-again');
		this.$readyButton = $('#ready-go');

		this.updateCigarette();

		this.video = this.$el.append('<video>').find('video');
		this.video.on('canplay', $.proxy(this.playStream, this));

		this.ctx = this.$streamCanvas[0].getContext('2d');
		this.avatarCtx = this.$avatarCanvas[0].getContext('2d');

		this.ctx.clearRect(0, 0, this.width, this.height);
		//this.image = this.ctx.getImageData(0, 0, this.width, this.height);

		if (this.context === 'webrtc') {
			this.setupWebcam();
		}

		if (this.context === 'mobile') {
			this.setupFallback();
		}
	};

	Avatar.prototype.updateCigarette = function(cigarette) {
		this.cigarette = new Image();
		this.cigarette.src = cigarette ? cigarette : 'img/cig1.png';
	};

	Avatar.prototype.getUserMedia = function(successCallback, errorCallback) {
		navigator.getUserMedia(
			{video: true, audio: false},
			$.proxy(successCallback, this),
			errorCallback);
	};

	Avatar.prototype.setupWebcam = function(stream) {
		this.getUserMedia(this.webcamCallback, this.onWebcamError);
	};

	Avatar.prototype.setupFallback = function(stream) {
		var self = this;
		$('#buffer-container')
			.append('<input id="fallbackInput" type="file" name="image" accept="image/*" capture>')
		$('#fallbackInput').css({
				position: 'absolute',
				bottom: 15,
				'z-index': 10,
				height: 40,
				opacity: 0

			})
			.on('change', function(e) {
				var file, reader, image;

				file = e.target.files[e.target.files.length - 1];

				reader = new FileReader();
				image = new Image();

				image.onload = function() {
					self.ctx.save();
					self.ctx.clearRect(0,0, 466, 350);
					self.ctx.rotate(90 * Math.PI / 180);
					self.ctx.drawImage(image, 0, -466, 466, 350);
					self.ctx.restore();
					self.drawCigarette(true);
				};

				reader.onloadend = function() {
					image.src = reader.result;
				};

				reader.readAsDataURL(file);

			});
		;


	};

	Avatar.prototype.webcamCallback = function(stream) {
		this.stream = stream;

		if (window.MediaStream !== undefined &&
			window.MediaStream !== null &&
			stream instanceof window.MediaStream
		) {

			if (this.video[0].mozSrcObject !== undefined) {
				this.video[0].mozSrcObject = stream;
			} else {
				this.video[0].src = stream;
			}

			return this.video[0].play();
		}

		var vendorURL = window.URL || window.webkitURL;
		this.video.attr('src', vendorURL ? vendorURL.createObjectURL(stream) : stream);
		this.video.attr('autoplay', true);

	};

	Avatar.prototype.onWebcamError = function(err) {
		console.log(err);
	};

	Avatar.prototype.playStream = function() {
		if (this.stopped === true) return;

		window.requestAnimationFrame($.proxy(this.playStream, this));
		this.drawCigarette();
	};

	Avatar.prototype.drawCigarette = function(file) {
		if (!file) {
			this.ctx.drawImage(this.video[0], 0, 0);
		}

		if(!this.timestamp) {
			this.timestamp = Date.now();
		}

		if(Date.now() - this.timestamp > 1000 || file === true) {
			this.timestamp = Date.now();
			var comp = ccv.detect_objects({
				'canvas': this.$streamCanvas[0],
				'cascade': face,
				'interval': 3,
				'min_neighbors': 2
			});

			this.sc = comp[0];
		}
		console.log(this.sc);

		if (this.sc) {
			this.ctx.save();
			this.ctx.drawImage(this.cigarette,
							   this.sc.x + this.sc.width/7,
							   this.sc.y + this.sc.height/1.1,
							   this.sc.width/1.45,
							   this.sc.height/1.3);
			this.ctx.restore();
			this.hasFace = true;
		} else {
			this.hasFace = false;
		}

	};

	Avatar.prototype.makeAvatar = function(e) {
		if (e) {
			e.preventDefault();
		}

		if (this.hasFace === true) {
			var idata = this.ctx.getImageData(206,0, 260, 350);
			this.avatarCtx.putImageData(idata, 0, 0);
			this.avatar = avatar.toDataURL('image/jpeg');
			this.pauseStream();

			this.$avatarCanvas.removeClass('hidden');
			this.$makeButton.addClass('hidden');
			this.$makeButton.siblings('.hidden').removeClass('hidden');
		}
	};

	Avatar.prototype.tryAgain = function() {
		this.$avatarCanvas.addClass('hidden');
		this.$tryAgainButton.addClass('hidden').siblings().addClass('hidden');
		this.$makeButton.removeClass('hidden');
		this.startAgain();
		return false;
	}

	Avatar.prototype.startAgain = function() {
		this.stopped = false;
		this.$streamCanvas.removeClass('hidden');
		this.playStream();
	};

	Avatar.prototype.pauseStream = function() {
		this.stopped = true;
		this.$streamCanvas.addClass('hidden');
	};

	Avatar.prototype.stopStream = function() {
		this.stopped = true;
		this.$streamCanvas.remove();
		this.stream.stop();
	}

	Avatar.prototype.selectAvatar = function() {
		var avatarImage, username, x, y, data;

		avatarImage = this.avatar;
		username = $('#username').val();
		x = Math.random() * 1000;
		y = Math.random() * (window.innerHeight - 420);

		if (!avatar || !username) {
			window.alert('fill in your username and take a selfie, plz');
			return false;
		}

		data = {
			'avatar' : avatarImage,
			'username' : utils.escapeHTML(username),
			'pos' : [x,y]
		};

		this.stopStream();

		return data;

	};


	module.exports = Avatar;

}());
