$(document).ready(function(){
	'use strict';

	// setting up sockets
	var socket = io.connect();
	var user_socket = null;

	var chat_window  = '<div id="pvt-chat">';
		chat_window += '	<textarea id="send-chat"></textarea>';
		chat_window += '	<button id="sender-chat-btn">send</button>';
		chat_window += '</div>';

	var user_list_item = function(user, classes) {
		var id = user.name,
			styles = 'left:' + user.pos[0] + 'px; top:' + user.pos[1]+'px',
			classes = 'user ' + classes;

		var item = '<li id="' + id + '" style="' + styles + '" class="' + classes + '">';
			item += '	<img src="'+ user.avatar +'" />';
			item += '</li>';

		return item;
	}

	var chat_request = function(name){
		if (!name) {
			return false
		}
		var request  = '<div id="pvt-request">';
			request +=		name + ' says hi. do you want to talk?';
			request +=		'<button id="yes">yes</button>';
			request +=		'<button id="no">no</button>';
			request += '</div>';

		return request;
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
		user_socket = username;
	});


	socket.on('users', function(data){
		$('#user-list').empty();

		for (var user in data) {
			var the_user = data[user],
				item;
			if (user_socket === the_user.name) {
				item = user_list_item(the_user, 'current_user');
			} else {
				item = user_list_item(the_user)
			}
			$('#user-list').append(item);
		}

		setTimeout(function(){
			$('.user').click(function(){
				var recipient = $(this).attr('id'),
					data =  { 'recipient':recipient, 'sender': user_socket };
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
			$('#pvt-request').remove();
			$('#room').append(chat_window);

			socket.emit('confirm pvt', confirm_data);
		});

	});

	socket.on('request accepted', function(data){
		$('#room').append(chat_window);
		$('#send-chat-btn').click(function(){
			var msg = $('#send-chat').val();
			var msg_data = {msg: msg};
			socket.emit('message', msg_data);
		});
	});

	$('#room').click(function(e){
		var $avatar = $('.current-user'),
			m_x = e.clientX - 150,
			m_y = e.clientY - 210;
		$avatar.css({
			'left' 	: m_x,
			'top'	: m_y
		});

		socket.emit('user move', { username: user_socket, new_pos: [m_x, m_y]});
	});



});
