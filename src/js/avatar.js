(function(){
	'use strict';

	var Avatar = function($el, $canvas, width, height, context) {
		this.$el = $el;
		this.canvas = $canvas;
		this.width = width;
		this.height = height;
		this.context = context;

		if (!this.context) {
			return;
		}

		this.ctx = this.canvas[0].getContext('2d');

		this.ctx.clearRect(0, 0, this.width, this.height);
		this.image = this.ctx.getImageData(0, 0, this.width, this.height);

		if (this.context === 'webrtc') {
			this.setupWebcam();
		}

		if (this.context === 'mobile') {
			this.setupFallback();
		}

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

		this.video = this.$el.append('<video>').find('video');
		this.stream = stream;

		if (window.MediaStream !== undefined &&
			window.MediaStream !== null &&
			stream instanceof window.MediaStream
		) {

			if (this.video.mozSrcObject !== undefined) {
				this.video.mozSrcObject = stream;
			} else {
				this.video.src = stream;


			}

			return this.video.play();

		}

		var vendorURL = window.URL || window.webkitURL;
		this.video.attr('src', vendorURL ? vendorURL.createObjectURL(stream) : stream);
		this.video.attr('autoplay', true);

		//this.video.onerror = function () {
			//App.stream.stop();
			//window.streamError();
		//};

	};

	Avatar.prototype.onWebcamError = function(err) {
		console.log(err);
	};


	module.exports = Avatar;

}());
