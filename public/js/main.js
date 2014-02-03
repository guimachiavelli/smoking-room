$(document).ready(function(){
	'use strict';

	// setting up sockets
	var socket = io.connect();
	var user_socket = {
		name: null,
		pvt_with: null
	};

	var socket_events = [
		'connection',
		'user enter',
		'user list update',
		'chat request',
		'message',
		'request accepted',
		'user move',
		'confirm pvt'
	]

	App.init();

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
		user_socket.name = username;
	});


	socket.on('user list update', function(data){
		$('#user-list').empty();

		for (var user in data) {
			var the_user = data[user],
				item;
			if (user_socket.name === the_user.name) {
				item = user_list_item(the_user, 'current-user');
			} else {
				item = user_list_item(the_user)
			}
			$('#user-list').append(item);
		}

		setTimeout(function(){
			$('.user').click(function(){
				var recipient = $(this).attr('id'),
					data = { 'recipient':recipient, 'sender': user_socket.name };
				socket.emit('start pvt', data);
			});
		}, 100);
	});

	socket.on('chat request', function(data){
		if ($('#pvt-request').length < 1) {
			var request_window = chat_request(data.from);
			$('#room').append(request_window);
		}

		$('#yes').click(function(){
			var confirm_data = {'with': data.from}
			var pvt_chat = chat_window(data.from);
			$('#pvt-request').remove();
			$('#room').append(pvt_chat);

			user_socket.pvt_with = data.from;
			socket.emit('request accepted', confirm_data);

			$('#send-chat-btn').click(function(){
				console.log(user_socket);
				var msg = $('#send-chat').val();
				var msg_data = {from: user_socket.name, to: user_socket.pvt_with, msg: msg};
				socket.emit('message', msg_data);
			});

		});

	});

	socket.on('request accepted', function(data){
		var pvt_chat = chat_window(data);
		user_socket.pvt_with = data;

		console.log(user_socket, data);

		$('#room').append(pvt_chat);
		$('#send-chat-btn').click(function(){
			var msg = $('#send-chat').val();
			var msg_data = {from: user_socket.name, to: user_socket.pvt_with, msg: msg};
			socket.emit('message', msg_data);
		});
	});

	socket.on('message', function(data){
		$('#pvt-chat').append('<li>' + data.msg + '</li>');
	});


	$('#room').click(function(e){
		var $avatar = $('.current-user'),
			m_x = e.clientX - 150,
			m_y = e.clientY - 210;

		$avatar.css({
			'left' 	: m_x,
			'top'	: m_y
		});

		socket.emit('user move', { username: user_socket.name, new_pos: [m_x, m_y]});
	});



});
