	var chat_window = function(to){
		var chat  = '<form id="pvt-chat" data-to="'+to+'">';
			chat += '	<ul id="pvt-chat-list"></ul>';
			chat += '	<textarea id="send-chat"></textarea>';
			chat += '	<button id="send-chat-btn">send</button>';
			chat += '	<a id="close-chat-btn" href="#">close</a>';
			chat += '</form>';

		return chat;
	}



	var user_list_item = function(user, classes) {
		if (!classes) classes = '';
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
			request +=		'<p>' + name + ' says hi. do you want to talk?</p>';
			request +=		'<button id="yes">yes</button>';
			request +=		'<button id="no">no</button>';
			request += '</div>';

		return request;
	}

