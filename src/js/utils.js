(function(){
	'use strict';

	var utils = {

		escapeHTML: function (string) {
			var pre, text;

			pre = document.createElement('pre');
			text = document.createTextNode(string);

			pre.appendChild(text);

			return pre.innerHTML;
		}


	};

	module.exports = utils;

}());
