(function(){
	'use strict';

	var $ = require('jquery'),
		face = require('face-detect'),
		ccv = require('ccv');


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

		this.$makeButton.on('click', $.proxy(this.makeAvatar, this));
		this.$tryAgainButton.on('click', $.proxy(this.tryAgain, this));

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

	Avatar.prototype.drawCigarette = function() {
		this.ctx.drawImage(this.video[0], 0, 0);

		if(!this.timestamp) {
			this.timestamp = Date.now();
		}

		if(Date.now() - this.timestamp > 1000) {
			this.timestamp = Date.now();
			var comp = ccv.detect_objects({
				'canvas': this.$streamCanvas[0],
				'cascade': face,
				'interval': 3,
				'min_neighbors': 2
			});

			this.sc = comp[0];
		}

		if (this.sc) {
			this.ctx.drawImage(this.cigarette,
							   this.sc.x + this.sc.width/7,
							   this.sc.y + this.sc.height/1.1,
							   this.sc.width/1.45,
							   this.sc.height/1.3);
			this.hasFace = true;
		} else {
			this.hasFace = false;
		}

	};

	Avatar.prototype.makeAvatar = function(e) {
		e.preventDefault();

		if (this.hasFace === true) {
			var idata = this.ctx.getImageData(206,0, 260, 350);
			this.avatarCtx.putImageData(idata, 0, 0);
			this.avatar = avatar.toDataURL('image/jpeg');
			this.stop();

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

	Avatar.prototype.stop = function() {
		this.stopped = true;
		this.$streamCanvas.addClass('hidden');
	};


	module.exports = Avatar;

}());
