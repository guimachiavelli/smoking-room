(function(){
	'use strict';

    var $ = require('jquery');

	var setupGetUserMedia = function() {
		window.navigator.getUserMedia = (window.navigator.getUserMedia ||
										 window.navigator.webkitGetUserMedia ||
										 window.navigator.mozGetUserMedia ||
										 window.navigator.msGetUserMedia
										);
	};


	var utils = {

		escapeHTML: function (string) {
			var pre, text;

			pre = document.createElement('pre');
			text = document.createTextNode(string);

			pre.appendChild(text);

			return pre.innerHTML;
		},

		getContext: function() {
			setupGetUserMedia();

			if (window.navigator.getUserMedia) {
				return 'webrtc';
			}

			if ('ontouchstart' in document.documentElement) {
				$('body').addClass('mobile');
				return 'mobile';
			}

			return false;
		}

	};

	module.exports = utils;

}());
