var App = {

	face	: false,
	stopped	: false,
	stream	: null,
	cam		: null,
	canvas	: null,
	cam_canvas: null,
	ctx		: null,
	width	: 466,
	height	: 350,
	sc: null,
	avatar: null,


	options: {
		// audio		: false,
		video 		: true,
		el			: 'webcam',
		// extern		: null,
		// append 		: true,
		// width 		: 466,
		// height 		: 350,
		// mode		: 'callback',
		// swffile		: 'js/fallback/jscam_canvas_only.swf',
		noFallback	: true,


	},




	init: function () {
		this.canvas = document.getElementById('buffer');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.image = this.ctx.getImageData(0, 0, this.width, this.height);

		// Initialize getUserMedia with options
		getUserMedia(this.options, this.success, this.deviceError);


		//$(document).on('click', 'body', function(){
			//App.avatarSelection();
			//console.log(1234);
		//});

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
				//App.options.videoEl.removeEventListener('canplay', App.avatarSelection());
			}


	},


	success: function (stream) {
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

	},

	deviceError: function (error) {
		console.error('An error occurred: [CODE ' + error.code + ']');
	},


	avatarSelection: function () {
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

	},


	draw: function (v,canvas,ctx,w,h) {
		ctx.drawImage(v,0,0,w,h);

		if(!App.timestamp) {
			App.timestamp = Date.now();
		}

		if(Date.now() - App.timestamp > 750) {
			App.timestamp = Date.now();
			var comp = ccv.detect_objects({
				'canvas': canvas,
				'cascade': cascade,
				'interval': 4,
				'min_neighbors': 1
			});

			App.sc = comp[0];
		}

		if (App.sc) {
			ctx.drawImage(App.glasses, App.sc.x+App.sc.width/7, App.sc.y+App.sc.height/1.1, App.sc.width/1.45, App.sc.height/1.3);
			App.face = true;
		} else {
			App.face = false;
		}

	},

	makeAvatar: function(){
		var buffer = document.getElementById('buffer');
		var buffer_ctx = buffer.getContext('2d');
		var avatar = document.getElementById('avatar');
		var avatar_ctx = avatar.getContext('2d');

		if (App.face === true) {
			// Grab the pixel data from the backing canvas
			var idata = buffer_ctx.getImageData(89,0, 260, 350);
			avatar_ctx.putImageData(idata, 0, 0);
			App.avatar =  avatar.toDataURL('image/jpeg');
		}
	},


};

App.glasses = new Image();
App.glasses.src = 'img/cig1.png';
