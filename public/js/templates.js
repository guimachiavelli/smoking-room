	var chat_window  = function(to){
		var chat ='<form id="pvt-chat" data-to="'+to+'">';
			chat += '	<textarea id="send-chat"></textarea>';
			chat += '	<a id="send-chat-btn">send</a>';
			chat += '</div>';

		return chat;
	}



	var user_list_item = function(user, classes) {
		if (!classes) classes = ''
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
			request +=		'<a id="yes">yes</a>';
			request +=		'<a id="no">no</a>';
			request += '</div>';

		return request;
	}

