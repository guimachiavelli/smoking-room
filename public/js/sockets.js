/*jslint browser: true */
/*devel: true */
/*global $, jQuery, sockets, App, io, templates */

var sockets = {
	socket: null,
	user_socket: {
		name: null,
		to: null
	},

	init: function() {
		// setting up sockets
		sockets.socket = io.connect();

		sockets.socket.on('user list update', function(data){
			templates.refresh_user_list(data);
		});


		sockets.socket.on('incoming chat request', function(data){
			sockets.chat_request_window(data);
		});


		sockets.socket.on('chat request accepted', function(data){
			sockets.chat_request_accepted(data);
			sockets.start_chat(data);
		});

		sockets.socket.on('message', function(data){
			templates.add_message(data);
		});


		sockets.socket.on('close chat', function(){
			sockets.user_socket.to = null;
			$('.chat-window').remove();
		});

		sockets.socket.on('chat request refused', function(){
			$('.chat-request').remove();
		});

		sockets.send_message();
		sockets.accept_request();
		sockets.refuse_request();

		$(document).on('click', '.user', function(){
			if ($('.chat-window').length > 0 || $(this).hasClass('current-user')) { return; }
			var to = $(this).attr('id');
			sockets.send_chat_request(to, sockets.user_socket.name);
		});

		$(document).on('click', '#smoke-btn', function(){
			templates.smoke_window();
			sockets.socket.emit('smoke shape');
		});

		sockets.socket.on('smoke shape', function(){
			templates.smoke_window();
		});

	},



	send_chat_request: function(to, from) {
		var data = {'to': to, 'from': from};
		sockets.socket.emit('send chat request', data);
	},

	accept_request: function() {
		$(document).on('click', '#yes', function(e){
			e.preventDefault();
			sockets.user_socket.to = $(this).parents('.chat-request').data('from');
			var data = {to: sockets.user_socket.to, from: sockets.user_socket.name};
			var local_data = {to: sockets.user_socket.name, from: sockets.user_socket.to};
			console.log('accept chat from ' + data.to + ' to ' + data.from);
			$('.chat-request').remove();
			sockets.start_chat(local_data);
			sockets.accept_chat_request(sockets.user_socket.to, sockets.user_socket.name);
		});
	},

	refuse_request: function() {
		$(document).on('click', '#no', function(e){
			e.preventDefault();
			$('.chat-request').remove();
			sockets.refuse_chat_request($(this).parents('.chat-request').data('from'), sockets.user_socket.name);
		});
	},


	chat_request_window: function(data) {
		if ($('.chat-request').length < 1 && ($('.chat-window').length < 1)) {
			var request_window = templates.chat_request(data.from);
			$('#room').append(request_window);
		} else {
			sockets.socket.emit('refuse chat request', data);
		}
	},

	start_chat: function(data) {
		if ($('.chat-window').length < 1) {
			var pvt_chat = templates.chat_window(data.from);
			$('#room').append(pvt_chat);
		}
	},


	accept_chat_request: function(to, from) {
		var data = {'to':to, 'from': from };
		sockets.socket.emit('accept chat request', data);
	},

	refuse_chat_request: function(to, from) {
		var data = {'to':to, 'from': from };
		sockets.socket.emit('refuse chat request', data);
		console.log('refuse chat request sent to ' + data.to);
	},


	chat_request_accepted: function(data) {
		sockets.user_socket.to = data.from;
	},



	send_message: function() {
		$(document).on('keyup', '.chat-send-message', function(e){
			if (e.keyCode === 13) {
				var msg = $(this).val();
				//var to = $(this).parents('.chat-window').data('to');
				$(this).val('');

				var msg_data = {from: sockets.user_socket.name, to: sockets.user_socket.to, msg: msg};

				console.log(msg_data);

				templates.add_message(msg_data);

				sockets.socket.emit('message', msg_data);

				return false;
			}
		});

		sockets.close_chat();
	},

	close_chat: function() {
		$(document).on('click', '.chat-close', function(e){
			e.preventDefault();
			var data = {from: sockets.user_socket.name, to: sockets.user_socket.to};
			$('#pvt-chat-list').append('<li><em>'+ sockets.user_socket.name + ' disconnected</em></li>');
			$('.chat-window').remove();
			sockets.socket.emit('close chat', data);
			sockets.user_socket.to = null;
		});
	},



};
