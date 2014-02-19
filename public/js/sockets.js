/*jslint browser: true */
/*devel: true */
/*global $, jQuery, sockets, App, io, templates */

var sockets = {
	socket: null,
	user_socket: {
		name: null,
		to: null
	},
	smokers: {},

	init: function() {
		// setting up sockets
		sockets.socket = io.connect();

		sockets.socket.on('user list update', function(data){
			templates.refresh_user_list(data);
		});


		sockets.socket.on('incoming chat request', function(data){
			sockets.chat_request_window(data);
		});


		sockets.socket.on('chat request accepted', function(to){
			sockets.start_chat(to);
		});

		sockets.socket.on('message', function(data){
			templates.add_message({from: data.to, to: data.from, msg: data.msg});
		});


		sockets.socket.on('close chat', function(to){
			$('.chat-window[data-to='+ to +']').append('<span class="disconnected">user disconnected</span');
			setTimeout(function(){
				$('.chat-window[data-to='+ to +']').remove();
			}, 5000);
		});

		sockets.socket.on('chat request refused', function(){
			$('.chat-request').remove();
		});

		sockets.send_message();
		sockets.accept_request();
		sockets.refuse_request();

		$(document).on('click', '.user', function(){
			if ($('.chat-window').length > 3 || $(this).hasClass('current-user')) { return; }
			var to = $(this).attr('id');
			to = to.substr(5);
			sockets.send_chat_request(to, sockets.user_socket.name);
		});

		sockets.socket.on('smoke shape', function(data){
			sockets.smokers[data.from].heart();
			setTimeout(function() {
				sockets.smokers[data.from].reset();
			}, 20000);

		});

	},



	send_chat_request: function(to, from) {
		var data = {'to': to, 'from': from};
		sockets.socket.emit('send chat request', data);
	},

	accept_request: function() {
		$(document).on('click', '#yes', function(e){
			e.preventDefault();
			var to = $(this).parents('.chat-request').data('from');
			$('.chat-request').remove();
			sockets.start_chat(to);
			sockets.accept_chat_request(to, sockets.user_socket.name);
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
		if ($('.chat-request').length < 4 && ($('.chat-window').length < 4)) {
			var request_window = templates.chat_request(data.from);
			$('#room').append(request_window);
		} else {
			sockets.socket.emit('refuse chat request', data);
		}
	},

	start_chat: function(to) {

		if ($('.chat-window').length > 3) {
			return;
		}

		var pvt_chat = templates.chat_window(to);
		$('#chat-windows').append(pvt_chat);
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


	send_message: function() {
		$(document).on('keyup', '.chat-send-message', function(e){
			if (e.keyCode === 13) {
				var msg = $(this).val();
				var to = $(this).parents('.chat-window').data('to');
				$(this).val('');

				var msg_data = {from: sockets.user_socket.name, to: to, msg: msg};

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
			var to = $(this).parents('.chat-window').data('to');
			var data = {from: sockets.user_socket.name, to: to};
			$('.chat-window[data-to='+to+']').remove();
			sockets.socket.emit('close chat', data);
		});
	},



};
