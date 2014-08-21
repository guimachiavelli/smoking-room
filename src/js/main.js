(function(){
	'use strict';

	var Smoke = require('./smoke'),
		Intro = require('./intro'),
		Room = require('./room'),
		Socket = require('./sockets'),
		utils = require('./utils'),
		$ = require('jquery');


	var context,
		setup,
		socket,
		room;

	context = utils.getContext();
	socket = new Socket();

	setup = new Intro($('#enter'), context, socket);
	room = new Room();

}());
