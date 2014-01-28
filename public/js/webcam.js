/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */

'use strict';

var App = {

	face: false,
	stopped: false,
	stream: null,

	init: function () {
		if ( !!this.options ) {
			this.pos = 0;
			this.cam = null;
			this.filter_on = false;
			this.filter_id = 0;
			this.canvas = document.getElementById("canvas");
			this.ctx = this.canvas.getContext("2d");
			this.img = new Image();
			this.ctx.clearRect(0, 0, 600, 420);
			this.image = this.ctx.getImageData(0, 0, 600, 420);

			// Initialize getUserMedia with options
			getUserMedia(this.options, this.success, this.deviceError);

			// Initialize webcam options for fallback
			window.webcam = this.options;

		} else {
			alert('No options were supplied to the shim!');
		}

		App.options.videoEl.addEventListener('canplay', function(){
			App.options.videoEl.removeEventListener('canplay');
			App.avatarSelection();
		});

	},

	options: {
		"audio": false,
		"video": true,
		el: "webcam",

		extern: null,
		append: true,

		width: 600,
		height: 420,

		mode: "save",
		// callback | save | stream
		swffile: "js/fallback/jscam_canvas_only.swf",
		quality: 25,
		context: "",
		effect: null,

		debug: function () {},

		// flash fallback options
		onCapture: function () {
			window.webcam.save();
		},
		onTick: function () {},
		onSave: function (data) {

			var col = data.split(";"),
				img = App.image,
				tmp = null,
				w = this.width,
				h = this.height;

			for (var i = 0; i < w; i++) {
				tmp = parseInt(col[i], 10);
				img.data[App.pos + 0] = (tmp >> 16) & 0xff;
				img.data[App.pos + 1] = (tmp >> 8) & 0xff;
				img.data[App.pos + 2] = tmp & 0xff;
				img.data[App.pos + 3] = 0xff;
				App.pos += 4;
			}

			if (App.pos >= 4 * w * h) {
				App.ctx.putImageData(img, 0, 0);
				App.pos = 0;
			}

		},
		onLoad: function () {}
	},

	success: function (stream) {

		if (App.options.context === 'webrtc') {
			var video = App.options.videoEl;

			if ((typeof MediaStream !== "undefined" && MediaStream !== null) && stream instanceof MediaStream) {

				if (video.mozSrcObject !== undefined) { //FF18a
					video.mozSrcObject = stream;
				} else { //FF16a, 17a
					video.src = stream;
				}

				return video.play();

			} else {
				var vendorURL = window.URL || window.webkitURL;
				video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
			}

			video.onerror = function () {
				stream.stop();
				streamError();
			};

		} else {
			window.webcam.capture();
		}

		App.stream = stream;
	},

	deviceError: function (error) {
		console.error('An error occurred: [CODE ' + error.code + ']');
	},


	avatarSelection: function () {
		if (!App.stopped) {
			requestAnimationFrame(App.avatarSelection);
		}

		if (App.options.context === 'webrtc') {
			var video = document.getElementsByTagName('video')[0];
			App.canvas.width = video.videoWidth;
			App.canvas.height = video.videoHeight;
			App.canvas.getContext('2d').drawImage(video, 0, 0);
		} else if(App.options.context === 'flash'){
			window.webcam.capture();
		}

		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');

		var cw = 560;
		var ch = 420;
		canvas.width = cw;
		canvas.height = ch;

		draw(video,canvas,ctx,cw,ch);

		function draw(v,canvas,ctx,w,h) {
			ctx.drawImage(v,0,0,w,h);
			var comp = ccv.detect_objects({
				"canvas": (canvas),
				"cascade": cascade,
				"interval": 1,
				"min_neighbors": 1
			});
			var sc = comp[0];
			if (comp[0]) {
				ctx.drawImage(App.glasses, sc.x, sc.y+sc.height/2.3, sc.width, sc.height*1.25);
				App.face = true;
			} else {
				App.face = false;
			}
		}
	},

	makeAvatar: function(){
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		var canvas2 = document.getElementById('canvas2');
		var ctx2 = canvas2.getContext('2d');

		if (App.face === true) {
			// Grab the pixel data from the backing canvas
			var idata = ctx.getImageData(200,0, 600, 420);
			ctx2.putImageData(idata, 0, 0);
		}
	},

	chooseAvatar: function(){
		var canvas = document.getElementById('canvas2');
		var ctx = canvas.getContext('2d');
		return canvas.toDataURL('image/jpeg');
	}
};

App.glasses = new Image();
App.glasses.src = 'img/cig3.png';
