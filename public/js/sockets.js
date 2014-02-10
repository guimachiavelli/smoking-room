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
			$('#pvt-chat').remove();
		});

		sockets.socket.on('chat request refused', function(){
			$('#pvt-request').remove();
		});


		sockets.send_message();
		sockets.accept_request();
		sockets.refuse_request();

		$(document).on('click', '.user', function(){
			var to = $(this).attr('id');
			sockets.send_chat_request(to, sockets.user_socket.name);
		});

		$(document).on('click', '#smoke-btn', function(){
			templates.smoke_window();
		});

	},

	start_chat: function(data) {
		if ($('#pvt_chat').length < 1) {
			var pvt_chat = templates.chat_window(data.from);
			$('#room').append(pvt_chat);
		}
	},

	close_chat: function() {
		$(document).on('click', '#close-chat-btn', function(e){
			e.preventDefault();
			var data = {from: sockets.user_socket.name, to: sockets.user_socket.to};
			$('#pvt-chat-list').append('<li><em>'+ sockets.user_socket.name + ' disconnected</em></li>');
			$('#pvt-chat').remove();
			sockets.socket.emit('close chat', data);
		});
	},

	send_chat_request: function(to, from) {
		var data = {'to': to, 'from': from};
		sockets.socket.emit('send chat request', data);
	},

	accept_request: function() {
		$(document).on('click', '#yes', function(e){
			e.preventDefault();
			sockets.user_socket.to = $(this).parents('#pvt-request').data('from');
			var data = {to: sockets.user_socket.to, from: sockets.user_socket.name};
			$('#pvt-request').remove();
			sockets.start_chat(data);
			sockets.accept_chat_request(sockets.user_socket.to, sockets.user_socket.name);
		});
	},

	refuse_request: function() {
		$(document).on('click', '#no', function(e){
			e.preventDefault();
			$('#pvt-request').remove();
			sockets.refuse_chat_request($(this).parents('#pvt-request').data('from'), sockets.user_socket.name);
		});
	},


	chat_request_window: function(data) {
		if ($('#pvt-request').length < 1) {
			var request_window = templates.chat_request(data.from);
			$('#room').append(request_window);
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
		$(document).on('click', '#send-chat-btn', function(e){
			e.preventDefault();

			var msg = $('#send-chat').val();
			$('#send-chat').val('');

			var msg_data = {from: sockets.user_socket.name, to: sockets.user_socket.to, msg: msg};

			templates.add_message(msg_data);

			sockets.socket.emit('message', msg_data);

			return false;
		});

		sockets.close_chat();
	},


};
