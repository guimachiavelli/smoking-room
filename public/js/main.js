$(document).ready(function(){
	'use strict';

	// setting up sockets
	var socket = io.connect();
	var user_socket = {
		name: null,
		to: null
	};

	var send_chat_request = function(to, from) {
		var data = {'to': to, 'from': from};
		socket.emit('send chat request', data);
	}

	var incoming_chat_request = function(to, from) {
		var data = {'to': to, 'from': from};
		socket.emit('incoming request chat', data);
	}

	var accept_chat_request = function(to, from) {
		var data = {'to':to, 'from': from };
		socket.emit('accept chat request', data)
	}

	var chat_request_accepted = function(to, from) {
		var data = {'to':to, 'from': from };
		socket.emit('accept chat', data)
	}

	var send_message = function() {
		$('#send-chat-btn').click(function(e){
			e.preventDefault();

			var msg = $('#send-chat').val();
			$('#send-chat').val('');

			var msg_data = {from: user_socket.name, to: user_socket.to, msg: msg};

			$('#pvt-chat-list').append('<li>'+ msg_data.from + ': ' + msg_data.msg + '</li>');

			socket.emit('message', msg_data);
			console.log('sent message to ' + msg_data.to + ' from ' + msg_data.from);

			return false;
		});
	}


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
			$('.user').click(function(){
				var to = $(this).attr('id');
				send_chat_request(to, user_socket.name);
			});

		}

	});


	socket.on('incoming chat request', function(data){
		if ($('#pvt-request').length < 1) {
			var request_window = chat_request(data.from);
			$('#room').append(request_window);
		}

		$('#yes').click(function(){
			var confirm_data = {'with': data.from};
			var pvt_chat = chat_window(data.from);
			$('#pvt-request').remove();
			$('#room').append(pvt_chat);

			user_socket.to = data.from;
			accept_chat_request(user_socket.to, user_socket.name);

			send_message();

		});

	});


	socket.on('chat request accepted', function(data){
		var pvt_chat = chat_window(data.from);
		user_socket.to = data.from;

		console.log(user_socket, data);

		$('#room').append(pvt_chat);
		send_message();
	});

	socket.on('message', function(data){
		$('#pvt-chat-list').append('<li>'+ data.from + ': ' + data.msg + '</li>');
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
