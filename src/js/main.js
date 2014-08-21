(function(){
	'use strict';

	var Smoke = require('./smoke'),
		Intro = require('./intro'),
		Socket = require('./sockets'),
		utils = require('./utils'),
		$ = require('jquery');


	var context,
		setup,
		socket;

	context = utils.getContext();
	socket = new Socket();

	setup = new Intro($('#enter'), context, socket);


}());
