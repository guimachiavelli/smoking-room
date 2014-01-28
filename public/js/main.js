'use strict';


/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */


window.onload = function(){

	$('.cig').click(function(){
		var cig_type = $(this).attr('id');
		$('.cig').removeClass('selected');
		$(this).addClass('selected');
		App.glasses.src = 'img/' + cig_type + '.png';
	})

	var socket = io.connect();
	var socketid = null;

	App.init();

	var $avatarBtn = $('#make-avatar');
	$avatarBtn.click(function(){
		App.makeAvatar()
	});

	var $readyBtn = $('#ready-go');
	$readyBtn.click(function(){
		var avatar = App.chooseAvatar(),
			username = $('#username').val(),
			data = {'avatar' : avatar, 'username' : username}
		console.log(avatar, username)

		if (!avatar || !username) {
			alert('fill in your username and take a selfie, plz');
			return false;
		}

		App.stream.stop();
		App.stopped = true;
		socket.emit('user enter', data);
		$('#set-up').fadeOut(100);
		$('canvas').remove();
	});


	var $msgBtn = $('#send');
	$msgBtn.click(function(){
		var the_msg = $('#message').val();
		socket.emit('message', the_msg);

		return false

	})

	socket.on('userid', function(data){
		socketid = data;
	});

	var $cig = $('#cig-list li');
	$cig.click(function(){
		var the_cig = $(this).find('img').attr('src');
		socket.emit('set cig', the_cig);
	})


	var $msgBtn = $('#send');
	$msgBtn.click(function(){
		var the_msg = $('#message').val();
		socket.emit('message', the_msg);
		$('#message').val('');

		return false

	})

	socket.on('message', function(data){
		$('#chat-entries').append('<p>' + data + '</p>');
	});

	socket.on('users', function(data){
		$('#user-list').empty();


		for (var user in data) {
			if (socketid === user) {
				$('#user-list').append('<li class="current_user"><img id="'+ data[user].name +'" src="'+ data[user].avatar +'" /></li>');
			} else {
				$('#user-list').append('<li><img id="'+ data[user].name +'" src="'+ data[user].avatar +'" /></li>');
			}
		}
	})


}



