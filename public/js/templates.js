/*jslint browser: true */
/*devel: true */
/*global $, jQuery, sockets, App */

var templates = {

	add_message: function(data){
		$('#pvt-chat-list').append('<li>'+ data.from + ': ' + data.msg + '</li>');
	},

	add_chat_window: function(data) {
		if ($('#pvt-request').length < 1) {
			var request_window = templates.chat_request(data.from);
			$('#room').append(request_window);
		}
	},


	refresh_user_list: function(data){
		var user, the_user, item;
		$('#user-list').empty();
		for (user in data) {
			if (data.hasOwnProperty(user)) {
				the_user = data[user];
				if (sockets.user_socket.name === the_user.name) {
					item = templates.user_list_item(the_user, 'current-user');
				} else {
					item = templates.user_list_item(the_user);
				}
				$('#user-list').append(item);
			}
		}
	},

	chat_window: function(to){
		var chat  = '<form id="pvt-chat" data-to="'+to+'">';
			chat += '	<ul id="pvt-chat-list"></ul>';
			chat += '	<textarea id="send-chat"></textarea>';
			chat += '	<button id="send-chat-btn">send</button>';
			chat += '	<a id="close-chat-btn" href="#">close</a>';
			chat += '	<a id="smoke-btn" href="#">send smoke shape</a>';
			chat += '</form>';

		return chat;
	},

	user_list_item: function(user, classes) {
		if (!classes) {
			classes = '';
		}
		var id = user.name,
			styles = 'left:' + user.pos[0] + 'px; top:' + user.pos[1]+'px';

		classes = 'user ' + classes;

		var item = '<li id="' + id + '" style="' + styles + '" class="' + classes + '">';
			item += '	<img src="'+ user.avatar +'" />';
			item += '</li>';

		return item;
	},

	chat_request: function(name){
		if (!name) {
			return false;
		}
		var request  = '<div id="pvt-request" data-from="'+name+'">';
			request +=		'<p>' + name + ' says hi. do you want to talk?</p>';
			request +=		'<button id="yes">yes</button>';
			request +=		'<button id="no">no</button>';
			request += '</div>';

		return request;
	},

	smoke_window: function(){
		window.makeSmokeWindow();
		window.heart();
	}

};
