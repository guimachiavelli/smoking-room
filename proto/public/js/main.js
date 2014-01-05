'use strict';


/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */

 (function () {

	var App = {

		init: function () {
			// The shim requires options to be supplied for it's configuration,
			// which can be found lower down in this file. Most of the below are
			// demo specific and should be used for reference within this context
			// only
			if ( !!this.options ) {

				this.pos = 0;
				this.cam = null;
				this.filter_on = false;
				this.filter_id = 0;
				this.canvas = document.getElementById("canvas");
				this.ctx = this.canvas.getContext("2d");
				this.img = new Image();
				this.ctx.clearRect(0, 0, this.options.width, this.options.height);
				this.image = this.ctx.getImageData(0, 0, this.options.width, this.options.height);
				this.snapshotBtn = document.getElementById('btn123');
				
				// Initialize getUserMedia with options
				getUserMedia(this.options, this.success, this.deviceError);

				// Initialize webcam options for fallback
				window.webcam = this.options;

				// Trigger a snapshot
				this.snapshotBtn.addEventListener('click',  this.getSnapshot);

			} else {
				alert('No options were supplied to the shim!');
			}
		},

		// options contains the configuration information for the shim
		// it allows us to specify the width and height of the video
		// output we're working with, the location of the fallback swf,
		// events that are triggered onCapture and onSave (for the fallback)
		// and so on.
		options: {
			"audio": false, //OTHERWISE FF nightlxy throws an NOT IMPLEMENTED error
			"video": true,
			el: "webcam",

			extern: null,
			append: true,

			// noFallback:true, use if you don't require a fallback

			width: 320, 
			height: 240, 

			mode: "stream",
			// callback | save | stream
			swffile: "js/fallback/jscam_canvas_only.swf",
			quality: 5,
			context: "",
			effect: 'hipster',

			debug: function () {},
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
		
					console.log('first')
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

			

			
		},

		deviceError: function (error) {
			alert('No camera available.');
			console.error('An error occurred: [CODE ' + error.code + ']');
		},

		changeFilter: function () {
			if (this.filter_on) {
				this.filter_id = (this.filter_id + 1) & 7;
			}
		},

		getSnapshot: function () {

			// If the current context is WebRTC/getUserMedia (something
			// passed back from the shim to avoid doing further feature
			// detection), we handle getting video/images for our canvas 
			// from our HTML5 <video> element.
			if (App.options.context === 'webrtc') {
				var video = document.getElementsByTagName('video')[0]; 
				App.canvas.width = video.videoWidth;
				App.canvas.height = video.videoHeight;
				App.canvas.getContext('2d').drawImage(video, 0, 0);

			// Otherwise, if the context is Flash, we ask the shim to
			// directly call window.webcam, where our shim is located
			// and ask it to capture for us.
			} else if(App.options.context === 'flash'){
				console.log(window.webcam);
				window.webcam.capture();
			}

			var canvas = document.getElementById('canvas');
			var ctx = canvas.getContext('2d');

   			var back = document.createElement('canvas');
    		var bctx = back.getContext('2d');

			var cw = 400;
			var ch = 300;
			canvas.width = cw;
			canvas.height = ch;
			
			back.width = cw;
        	back.height = ch;

			draw(video,ctx,ctx,cw,ch);
			
			function draw(v,c,bc,w,h) {
				bc.drawImage(v,0,0,w,h);
				// Grab the pixel data from the backing canvas
				var idata = bc.getImageData(0,0,w,h);
				var data = idata.data;
				// Loop through the pixels, turning them grayscale
				for(var i = 0; i < data.length; i+=4) {

					var r = data[i];
					var g = data[i+1];
					var b = data[i+2];
					var brightness = (3*r+4*g+b)>>>3;
					data[i] = r * 3;
					data[i+1] = g * 2;
					data[i+2] = b * 10;
				}

				//				idata.data = data;
				// Draw the pixels onto the visible canvas
				c.putImageData(idata,0,0);
				// Start over!
				setTimeout(function(){ draw(v,c,bc,w,h); }, 0);
			

			}

		}


	};

	App.init();

})();



window.onload = function(){

	var socket = io.connect('http://localhost');
	var el = document.getElementById('stage');	
	socket.on('turn passed', function (data) {
		//el.innerHTML = data.log;
		
		el.innerHTML = data.stage;
	});	

	socket.on('disconnect', function() {
		io.sockets.emit('user disconnected');
	});


}
