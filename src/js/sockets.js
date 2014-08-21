(function(){
	'use strict';

	var io = require('socket.io-client'),
		templates = require('./templates');

	var Sockets = function() {
		this.socket = io.connect();
		this.user = {
			name: null,
			to: null
		};
		this.smokers = {};

		$('#yes').on('click', this.onAcceptRequest);
		$('#no').on('click', this.onRefuseRequest);
		$('.chat-send-message').on('keyup', this.onSendMessage);
		$(document).on('click', '.user', this.onSendChatRequest);

		this.socket.on('new name', $.proxy(this.onNewName, this));
		this.socket.on('user list update', $.proxy(this.onUserListUpdate, this));
		this.socket.on('incoming chat request', this.onIncomingChatRequest);
		this.socket.on('chat request accepted', this.onChatRequestAccepted);
		this.socket.on('chat request refused', this.onChatRequestRefused);
		this.socket.on('message', this.onMessage);
		this.socket.on('close chat', this.onChatClose);
		this.socket.on('smoke shape', this.onSmokeShape);

	};

	Sockets.prototype.onUserListUpdate = function(data){
		templates.refresh_user_list(data, this.user, this.smokers);
	};

	Sockets.prototype.onNewName = function(data){
		console.log(this);
		this.user.name = data;
	};

	Sockets.prototype.onIncomingChatRequest = function(data){
		this.chatRequestWindow(data);
	};

	Sockets.prototype.onChatRequestRefused = function(to){
		this.startChat(to);
	};

	Sockets.prototype.onMessage = function(data){
		templates.add_message({
			from: data.from,
			to: data.to,
			msg: data.msg
		});
	};

	Sockets.prototype.onChatClose = function(to){
		$('.chat-window[data-to='+ to +']')
			.append('<span class="disconnected">user disconnected</span');
		setTimeout(function(){
			$('.chat-window[data-to='+ to +']').remove();
		}, 5000);
	};

	Sockets.prototype.onChatRequestRefused = function(){
		$('.chat-request').remove();
	};

	Sockets.prototype.onSmokeShape = function(data){
		this.smokers[data.from].heart();
		setTimeout(function() {
			sockets.smokers[data.from].reset();
		}, 20000);
	};

	Sockets.prototype.onSendChatRequest = function(data) {
		if ($('.chat-window').length > 3 || $(this).hasClass('current-user')) { return; }
		var to, request;
		to = $(this).attr('id').substr(5);

		this.sendChatRequest(to, this.user.name);

		request = templates.chat_request_sent();

		$('#room').append(request);

		setTimeout(function(){
			$('.chat-request-sent').remove();
		}, 3000);
	};

	Sockets.prototype.sendChatRequest = function(to, from) {
		var data = {'to': to, 'from': from};
		this.socket.emit('send chat request', data);
	};

	Sockets.prototype.onAcceptRequest = function(e) {
		e.preventDefault();

		var to = $(this).parents('.chat-request').data('from');
		$('.chat-request').remove();
		this.startChat(to);
		this.acceptChatRequest(to, this.user.name);
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
			this.socket.emit('refuse chat request', data);
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
		this.socket.emit('accept chat request', data);
	};

	Sockets.prototype.refuseChatRequest = function(to, from) {
		var data = {'to':to, 'from': from };
		this.socket.emit('refuse chat request', data);
		//console.log('refuse chat request sent to ' + data.to);
	};


	Sockets.prototype.onSendMessage = function(e) {
		var msg, to, msgData;
		if (e.keyCode === 13) {
			msg = $(this).val();
			to = $(this).parents('.chat-window').data('to');
			$(this).val('');

			msgData = {from: this.user.name, to: to, msg: msg};

			templates.add_message(msgData);

			this.socket.emit('message', msgData);

			return false;
		}

		this.closeChat();
	};

	Sockets.prototype.closeChat = function() {
		$(document).on('click', '.chat-close', function(e){
			e.preventDefault();
			var to = $(this).parents('.chat-window').data('to');
			var data = {from: this.user.name, to: to};
			$('.chat-window[data-to='+to+']').remove();
			this.socket.emit('close chat', data);
		});
	};

	module.exports = Sockets;

}());
