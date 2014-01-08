'use strict';


/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */


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

			mode: "save",
			// callback | save | stream
			swffile: "js/fallback/jscam_canvas_only.swf",
			quality: 25,
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


		makeAvatar: function (flags) {

			var socket = io.connect();



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
				window.webcam.capture();
			}

			var canvas = document.getElementById('canvas');
			var ctx = canvas.getContext('2d');

   			var back = document.createElement('canvas');
    		var bctx = back.getContext('2d');

			var cw = 320;
			var ch = 240;
			canvas.width = cw;
			canvas.height = ch;
			
			back.width = cw;
        	back.height = ch;
			

			draw(video,canvas,ctx,cw,ch,flags);
			
			function draw(v,canvas, ctx, w,h, flags) {
				var bc = ctx;

				bc.drawImage(v,0,0,w,h);
				// Grab the pixel data from the backing canvas
				var idata = bc.getImageData(0,0,w,h);
				var data = idata.data;

				if (flags === 'vitamin') {
					// Loop through the pixels
					for(var i = 0; i < data.length; i+=4) {

						var r = data[i];
						var g = data[i+1];
						var b = data[i+2];
						data[i] = r * 3;
						data[i+1] = g * 20;
						data[i+2] = b;
					}
				} else if (flags === 'vitamin-a') {
				
				  var sy = y;
				  var sx = x;
				  var dstOff = (y*w+x)*4;
				  // calculate the weighed sum of the source image pixels that
				  // fall under the convolution matrix
				  var r=0, g=0, b=0, a=0;
				  for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
					  var scy = sy + cy - halfSide;
					  var scx = sx + cx - halfSide;
					  if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
						var srcOff = (scy*sw+scx)*4;
						var wt = weights[cy*side+cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					  }
					}
				  }
				  dst[dstOff] = r;
				  dst[dstOff+1] = g;
				  dst[dstOff+2] = b;
				  dst[dstOff+3] = a + alphaFac*(255-a);

				}

				// idata.data = data;
				// Draw the pixels onto the visible canvas
				bc.putImageData(idata,0,0);

				var imgData = canvas.toDataURL('image/jpeg');
				socket.emit('set avatar', imgData);

				// Start over!
				//setTimeout(function(){ 
				//	draw(v,canvas,ctx,w,h);  
				//	socket.emit('video', imgData);
				//}, 300);

			}

		},

		convolute: function(pixels, weights, opaque) {
			var tmpCanvas = document.createElement('canvas');
			var tmpCtx = Filters.tmpCanvas.getContext('2d');

			var createImageData = function(w,h) {
			  return this.tmpCtx.createImageData(w,h);
			};

			  var side = Math.round(Math.sqrt(weights.length));
			  var halfSide = Math.floor(side/2);
			  var src = pixels.data;
			  var sw = pixels.width;
			  var sh = pixels.height;
			  // pad output by the convolution matrix
			  var w = sw;
			  var h = sh;
			  var output = createImageData(w, h);
			  var dst = output.data;
			  // go through the destination image pixels
			  var alphaFac = opaque ? 1 : 0;
			  for (var y=0; y<h; y++) {
				for (var x=0; x<w; x++) {
				  var sy = y;
				  var sx = x;
				  var dstOff = (y*w+x)*4;
				  // calculate the weighed sum of the source image pixels that
				  // fall under the convolution matrix
				  var r=0, g=0, b=0, a=0;
				  for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
					  var scy = sy + cy - halfSide;
					  var scx = sx + cx - halfSide;
					  if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
						var srcOff = (scy*sw+scx)*4;
						var wt = weights[cy*side+cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					  }
					}
				  }
				  dst[dstOff] = r;
				  dst[dstOff+1] = g;
				  dst[dstOff+2] = b;
				  dst[dstOff+3] = a + alphaFac*(255-a);
				}
			  }
			  return output;
		}



	};





window.onload = function(){

	var socket = io.connect();

	App.init();
	
	var $avatarBtn = $('#make-avatar');
	$avatarBtn.click(function(){	
		App.makeAvatar()
	});
	
	var $avatarBtn = $('#vitamin');
	$avatarBtn.click(function(){	
		App.makeAvatar('vitamin');
	});

	var $avatar2Btn = $('#vitamin-a');
	$avatar2Btn.click(function(){	
		App.makeAvatar('vitamin-a');
	});



	var $userBtn = $('#username-btn');
	$userBtn.click(function(){
		var the_name = $('#user-field').val();
		socket.emit('set user', the_name);

		return false

	});

	var $msgBtn = $('#send');
	$msgBtn.click(function(){
		var the_msg = $('#message').val();
		socket.emit('message', the_msg);

		return false

	})
	
	socket.on('message', function(data){
		$('#chat-entries').append('<p>' + data + '</p>');

		
		
	});

	socket.on('users', function(data){
		$('#user-list').empty();

		for (var user in data) {
			
			$('#user-list').append('<canvas id="'+ user +'" width="320" height="240"/>');
			
			var the_canvas = $('#'+user)[0];
			var ctx = the_canvas.getContext('2d');
			var myImage = new Image();

			myImage.src = data[user].avatar;
			ctx.drawImage(myImage, 0, 0);

		}
		

	})


}



