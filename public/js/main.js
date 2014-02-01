'use strict';


/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */


window.onload = function(){
	// setting up sockets
	var socket = io.connect();
	var user_socket = null;

	// avatar creation and intro page
	$('.cig').click(function(){
		var cig_type = $(this).attr('id');
		$('.cig').removeClass('selected');
		$(this).addClass('selected');
		App.glasses.src = 'img/' + cig_type + '.png';
	})

	App.init();

	var $avatarBtn = $('#make-avatar');
	$avatarBtn.click(function(){
		App.makeAvatar()
	});

	var $cig = $('#cig-list li');
	$cig.click(function(){
		var the_cig = $(this).find('img').attr('src');
	})

	var $readyBtn = $('#ready-go');
	$readyBtn.click(function(){
		var avatar = App.chooseAvatar(),
			username = $('#username').val(),
			x = Math.random() * 1000,
			y = Math.random() * (window.innerHeight - 420);
		var data = {
			'avatar' : avatar,
			'username' : username,
			'pos' : [x,y]
		}

		if (!avatar || !username) {
			alert('fill in your username and take a selfie, plz');
			return false;
		}

		App.stream.stop();
		App.stopped = true;
		socket.emit('user enter', data);
		$('#set-up').fadeOut(100);
		$('canvas').remove();
		user_socket = username;
	});


	/*
	 *var $msgBtn = $('#send');
	 *$msgBtn.click(function(){
	 *    var the_msg = $('#message').val();
	 *    socket.emit('message', the_msg);
	 *    return false
	 *})
	 */

	/*
	 *socket.on('message', function(data){
	 *    $('#chat-entries').append('<p>' + data + '</p>');
	 *});
	 */

	socket.on('chat request', function(data){
		console.log(data);
	});


	socket.on('users', function(data){
		$('#user-list').empty();

		for (var user in data) {
			console.log(user, user_socket);
			var the_user = data[user];
			if (user_socket === the_user.name) {
				$('#user-list').append('<li id="' + user_socket + '" style="left:'+the_user.pos[0]+'px; top:'+the_user.pos[1]+'px" class="user current-user"><img id="'+ the_user.name +'" src="'+ the_user.avatar +'" /></li>');
			} else {
				$('#user-list').append('<li id="' + user_socket + '" style="left:'+the_user.pos[0]+'px; top:'+the_user.pos[1]+'px" class="user"><img id="'+ data[user].name +'" src="'+ data[user].avatar +'" /></li>');
			}
		}

		setTimeout(function(){
			$('.user').click(function(){
				var recipient = $(this).attr('id'),
					data =  { 'recipient':recipient, 'sender': user_socket };

				console.log(data);

//				socket.emit('start pvt',);
			});
		}, 100);
	});


	$('#room').click(function(e){
		var $avatar = $('.current-user'),
			m_x = e.clientX - 150,
			m_y = e.clientY - 210;
		$avatar.css({
			'left' 	: m_x,
			'top'	: m_y
		});

		console.log(user_socket);

		socket.emit('user move', { username: user_socket, new_pos: [m_x, m_y]});
	});
}
