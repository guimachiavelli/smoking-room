(function(){
	'use strict';

	var Smoke = require('./smoke'),
		Intro = require('./intro'),
		getContext = require('./getContext'),
		$ = require('jquery');


	var context,
		setup;

	context = getContext();

	setup = new Intro($('#enter'), context);


}());
