(function(){
	'use strict';

	var Smoke = require('./smoke'),
		Avatar = require('./avatar'),
		Intro = require('./intro'),
		getContext = require('./getContext'),
		$ = require('jquery');


	var context,
		setup,
		avatarCreator;

	context = getContext();

	setup = new Intro($('#enter'), context);


	$(document).ready(function(){
		avatarCreator = new Avatar(
			$('#webcam'),
			$('#buffer'),
			466,
			350,
			context
		);
	});



}());
