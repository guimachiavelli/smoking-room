(function(){
	'use strict';

	var Avatar = function($el, canvas, width, height) {
		this.$el = $el;
		this.width = width;
		this.height = height;

		this.canvas = this.$el.find('canvas')[0];

		this.face = false;
		this.stopped = false;
		this.stream = null;
		this.cam = null;
		this.canvas = null;
		this.cam_canvas = null;
		this.ctx = null;
		this.src = null;
		this.avatar = null;

		this.ctx = this.canvas.getContext('2d');
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.image = this.ctx.getImageData(0, 0, this.width, this.height);

		// Initialize getUserMedia with options
		getUserMedia(this.options, this.success, this.deviceError);

		// Initialize webcam options for fallback
		window.webcam = this.options;

		var $avatarBtn = $('#make-avatar');
		$avatarBtn.click(function(){
			App.makeAvatar();
			if (App.face === false) {
				return false;
			}

			$('#avatar').show();

			$(this).addClass('hidden');
			$(this).siblings('.hidden').removeClass('hidden');
			return false;
		});

		$(document).on('click', '#try-again', function() {
			$('#avatar').hide();
			$(this).addClass('hidden').siblings().addClass('hidden');
			$('#make-avatar').removeClass('hidden');
			return false;
		});

		// avatar creation and intro page
		$('.cig').click(function(){
			var cig_type = $(this).attr('id');
			$('.cig').removeClass('selected');
			$(this).addClass('selected');
			App.glasses.src = 'img/' + cig_type + '.png';
		});

		if (App.options.videoEl) {
			App.options.videoEl.addEventListener('canplay', App.avatarSelection());
		}

	};

	Avatar.prototype.options = {
		video 		: true,
		el			: 'webcam',
		noFallback	: true
	};

	Avatar.prototype.makeAvatar = function() {
		var buffer, bufferCtx, avatar, avatarCtx;

		buffer = document.getElementById('buffer');
		buffer = buffer.getContext('2d');

		avatar = document.getElementById('avatar');
		avatar = avatar.getContext('2d');

		if (this.face === true) {
			var idata = buffer.getImageData(89,0, 260, 350);
			avatar.putImageData(idata, 0, 0);
			this.avatar = avatar.toDataURL('image/jpeg');
		}
	};

	Avatar.prototype.draw = function (v,canvas,ctx,w,h) {
		ctx.drawImage(v,0,0,w,h);

		if(!this.timestamp) {
			this.timestamp = Date.now();
		}

		if(Date.now() - App.timestamp > 750) {
			this.timestamp = Date.now();
			var comp = ccv.detect_objects({
				'canvas': canvas,
				'cascade': cascade,
				'interval': 4,
				'min_neighbors': 1
			});

			this.sc = comp[0];
		}

		if (this.sc) {
			ctx.drawImage(App.glasses, App.sc.x+App.sc.width/7, App.sc.y+App.sc.height/1.1, App.sc.width/1.45, App.sc.height/1.3);
			this.face = true;
		} else {
			this.face = false;
		}

	};

	Avatar.prototype.avatarSelection = function () {
		var	video;
		if (!App.stopped) {
			window.requestAnimationFrame(App.avatarSelection);
		}

		if (App.options.context === 'webrtc') {
			video = document.getElementsByTagName('video')[0];
			App.canvas.width = video.videoWidth;
			App.canvas.height = video.videoHeight;
			App.canvas.getContext('2d').drawImage(video, 0, 0);
		} else if(App.options.context === 'flash'){
			video = window.webcam.capture();
		}


		var cw = 466;
		var ch = 350;
		App.canvas.width = cw;
		App.canvas.height = ch;
		App.draw(video,App.canvas,App.ctx,cw,ch);

	};

	Avatar.prototype.deviceError = function (error) {
		console.error('An error occurred: [CODE ' + error.code + ']');
	};

	Avatar.prototype.success = function (stream) {
		App.stream = stream;

		if (App.options.context === 'webrtc') {
			var video = App.options.videoEl;

			if (window.MediaStream !== undefined && window.MediaStream !== null && stream instanceof window.MediaStream) {

				if (video.mozSrcObject !== undefined) {
					video.mozSrcObject = stream;
				} else {
					video.src = stream;
				}

				return video.play();

			}

			var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;

			video.onerror = function () {
				App.stream.stop();
				window.streamError();
			};



		} else {
			App.avatarSelection();
			//flash
		}

	};

	module.exports = Avatar;

}());
