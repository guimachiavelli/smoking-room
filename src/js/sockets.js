(function(){
	'use strict';

	var io = require('socket.io-client');

	var Sockets = function() {
		this.socket = io.connect();
		this.user = {
			name: null,
			to: null
		},
		this.smokers = {};

		$('#yes').on('click', this.onAcceptRequest);
		$('#no').on('click', this.onRefuseRequest);
		$('.chat-send-message').on('keyup', this.onSendMessage);

		this.socket.on('user list update', this.onUserListUpdate);
		this.socket.on('new name', this.onNewName);
		this.socket.on('incoming chat request', this.onIncomingChatRequest);
		this.socket.on('chat request accepted', this.onChatRequestAccepted);
		this.socket.on('chat request refused', this.onChatRequestRefused);
		this.socket.on('message', this.onMessage);
		this.socket.on('close chat', this.onChatClose);


			this.socket.on('user list update', function(data){
				templates.refresh_user_list(data);
			});

			this.socket.on('new name', function(data){
				sockets.user_socket.name = data;
			});


			this.socket.on('incoming chat request', function(data){
				sockets.chat_request_window(data);
			});


			this.socket.on('chat request accepted', function(to){
				sockets.start_chat(to);
			});

			this.socket.on('message', function(data){
				templates.add_message({from: data.from, to: data.to, msg: data.msg});
			});


			this.socket.on('close chat', function(to){
				$('.chat-window[data-to='+ to +']').append('<span class="disconnected">user disconnected</span');
				setTimeout(function(){
					$('.chat-window[data-to='+ to +']').remove();
				}, 5000);
			});

			this.socket.on('chat request refused', function(){
				$('.chat-request').remove();
			});

			$(document).on('click', '.user', this.onSendChatRequest);
			this.socket.on('smoke shape', this.onSmokeShape);

	};

	Sockets.prototype.onSmokeShape = function(data){
		sockets.smokers[data.from].heart();
		setTimeout(function() {
			sockets.smokers[data.from].reset();
		}, 20000);
	};

	Sockets.prototype.onSendChatRequest = function(data) {
		if ($('.chat-window').length > 3 || $(this).hasClass('current-user')) { return; }
		var to = $(this).attr('id');
		to = to.substr(5);
		sockets.send_chat_request(to, sockets.user_socket.name);
		var request = templates.chat_request_sent();
		$('#room').append(request);
		setTimeout(function(){
			$('.chat-request-sent').remove();
		}, 3000);
	};

	Sockets.prototype.sendChatRequest = function(to, from) {
		var data = {'to': to, 'from': from};
		sockets.socket.emit('send chat request', data);
	};

	Sockets.prototype.onAcceptRequest = function(e) {
		e.preventDefault();

		var to = $(this).parents('.chat-request').data('from');
		$('.chat-request').remove();
		this.startChat(to);
		this.acceptChatRequest(to, sockets.user_socket.name);
	};

	Sockets.prototype.onRefuseRequest = function(e) {
		e.preventDefault();
		$('.chat-request').remove();
		this.refuseChatRequest(
			$(this).parents('.chat-request').data('from'),
			this.user.name
		);
	};


	Sockets.prototype.chatRequestWindow = function(data) {
		if ($('.chat-request').length < 4 && ($('.chat-window').length < 4)) {
			var request_window = templates.chat_request(data.from);
			$('#room').append(request_window);
		} else {
			sockets.socket.emit('refuse chat request', data);
		}
	};

	Sockets.prototype.startChat = function(to) {

		if ($('.chat-window').length > 3) {
			return;
		}

		var pvt_chat = templates.chat_window(to);
		$('#chat-windows').append(pvt_chat);
	};


	Sockets.prototype.acceptChatRequest = function(to, from) {
		var data = {'to':to, 'from': from };
		sockets.socket.emit('accept chat request', data);
	};

	Sockets.prototype.refuseChatRequest = function(to, from) {
		var data = {'to':to, 'from': from };
		sockets.socket.emit('refuse chat request', data);
		console.log('refuse chat request sent to ' + data.to);
	};


	Sockets.prototype.onSendMessage = function(e) {
			if (e.keyCode === 13) {
				var msg = $(this).val();
				var to = $(this).parents('.chat-window').data('to');
				$(this).val('');

				var msg_data = {from: sockets.user_socket.name, to: to, msg: msg};

				templates.add_message(msg_data);

				sockets.socket.emit('message', msg_data);

				return false;
			}

		this.closeChat();
	};

	Sockets.prototype.closeChat = function() {
		$(document).on('click', '.chat-close', function(e){
			e.preventDefault();
			var to = $(this).parents('.chat-window').data('to');
			var data = {from: sockets.user_socket.name, to: to};
			$('.chat-window[data-to='+to+']').remove();
			sockets.socket.emit('close chat', data);
		});
	};

	module.exports = Sockets;

}());
