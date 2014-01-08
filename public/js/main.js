'use strict';


/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */


window.onload = function(){

	var socket = io.connect();

	


	var $mouth = $('#mouth-list li');
	$mouth.click(function(){
		var the_mouth = $(this).find('img').attr('src');
		console.log(the_mouth);
		socket.emit('set mouth', the_mouth);
	})

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
			
			//$('#user-list').append('<canvas id="'+ user +'" width="320" height="240"/>');
			$('#user-list').append('<img src="' + data[user].avatar + '" alt="">');
			/*
			var the_canvas = $('#'+user)[0];
			var ctx = the_canvas.getContext('2d');
			var myImage = new Image();

			myImage.src = data[user].avatar;
			ctx.drawImage(myImage, 0, 0);
			*/
		}
		

	})


}



