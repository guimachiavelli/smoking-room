/*jslint browser: true */
/*devel: true */
/*global $, jQuery, sockets, App */

var templates = {

	add_message: function(data){
		var user_type = 'other-user';
		if (data.from === sockets.user_socket.name) {
			user_type = 'current-user';
		}
		$('.chat-window[data-to='+sockets.user_socket.to+']').find('.chat-messages').append('<li class="chat-message '+user_type+'">' + data.msg + '</li>');
		var objDiv = $(".chat-messages")[0];
		objDiv.scrollTop = objDiv.scrollHeight;
	},

	chat_window: function(to){
		var chat  = '<div class="chat-window box" data-to="'+to+'">';
			chat += '	<header class="chat-options">';
			chat += '		<h1 class="chat-name">' + to + '</h1>';
			chat += '		<a class="chat-hide">Hide</a>';
			chat += '		<a class="chat-close">Close</a>';
			chat += '	</header>';
			chat += '	<ul class="chat-messages"></ul>';
			chat += '	<form class="chat-form">';
			chat += '		<textarea class="chat-send-message"></textarea>';
			chat += '	</form>';
			chat += '</div>';

		return chat;
	},



	add_chat_window: function(data) {
		if ($('.chat-request').length < 1) {
			var request_window = templates.chat_request(data.from);
			$('#room').append(request_window);
		}
	},



	refresh_user_list: function(data){
		var user, the_user, smoke, $active_users, active_users = [], control_id, new_users = [];

		$active_users = $('.user');
		$active_users.each(function(){
			active_users.push('#' + $(this).attr('id'));
		});

		for (user in data) {
			if (data.hasOwnProperty(user)) {
				the_user = data[user];
				new_users.push('#user-' + the_user.name);


				if ($('#user-'+the_user.name).length > 0) {
					$('#user-'+the_user.name).css({
						'left' 	: the_user.pos[0],
						'top' 	: the_user.pos[1]
					});
					continue;
				}

				if (sockets.user_socket.name === the_user.name) {
					templates.user_list_item(the_user, 'current-user');
					smoke = new Smoke(the_user.name);
					$(document).on('click', '#heart', function(e){
						sockets.socket.emit('smoke shape', {from: sockets.user_socket.name});
						e.preventDefault();
						smoke.heart();
						setTimeout(function() {
							smoke.reset();
						}, 3000);
					});



				} else {
					templates.user_list_item(the_user);
					sockets.smokers[the_user.name] = new Smoke(the_user.name);
				}
			}
		}



		$.each(active_users, function(i){
			if ($.inArray(active_users[i], new_users) < 0){
				console.log(active_users[i] + ' does not exist in ' + new_users);
				$(active_users[i]).remove();
			}
		});
	},


	user_list_item: function(user, classes) {
		if (!classes) {
			classes = '';
		}
		var id = user.name,
			styles = 'left:' + user.pos[0] + 'px; top:' + user.pos[1]+'px';

		classes = 'user ' + classes;

		var item = '<li id="user-' + id + '" style="' + styles + '" class="' + classes + '">';
			item += '	<img src="'+ user.avatar +'" />';
			item += '	<canvas width="175" height="175" class="smoke" id="' + id + '"></canvas>';
			item += '</li>';

			$('#user-list').append(item);

		return item;
	},

	chat_request: function(name){
		if (!name) {
			return false;
		}
		var request  = '<div class="chat-request" data-from="'+name+'">';
			request +=		'<p>' + name + ' says hi. do you want to talk?</p>';
			request +=		'<a href="#" id="yes">Yes</a>';
			request +=		'<a href="#" id="no">No</a>';
			request += '</div>';

		return request;
	},

	smoke_window: function(){
		//indow.heart();
	}

};
