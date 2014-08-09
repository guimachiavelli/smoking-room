(function(){
	'use strict';

	var context, setupGetUserMedia;

	context = function() {
		setupGetUserMedia();

		if (window.navigator.getUserMedia) {
			return 'webrtc';
		}

        if ('ontouchstart' in document.documentElement) {
            return 'mobile';
        }

		return false;
	};


	setupGetUserMedia = function() {
		window.navigator.getUserMedia = (window.navigator.getUserMedia ||
										 window.navigator.webkitGetUserMedia ||
										 window.navigator.mozGetUserMedia ||
										 window.navigator.msGetUserMedia
										);
	};



	module.exports = context;
}());
