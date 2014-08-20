(function(){
	'use strict';

	var Smoke = require('./smoke'),
		Intro = require('./intro'),
		Socket = require('./sockets'),
		getContext = require('./getContext'),
		$ = require('jquery');


	var context,
		setup,
		socket;

	context = getContext();
	socket = new Socket();

	setup = new Intro($('#enter'), context, socket);


}());
