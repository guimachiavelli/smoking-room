(function($){
	'use strict';

var $readyBtn = $('#ready-go');

$readyBtn.click(function(){
	var avatar = App.avatar,
		username = $('#username').val(),
		x = Math.random() * 1000,
		y = Math.random() * (window.innerHeight - 420);
	var data = {
		'avatar' : avatar,
		'username' : escapeHTML(username),
		'pos' : [x,y]
	};

	if (!avatar || !username === null) {
		window.alert('fill in your username and take a selfie, plz');
		return false;
	}

	App.stream.stop();
	App.stopped = true;
	sockets.socket.emit('user enter', data);
	$('#intro').animate(
		{'bottom': -1000},
		1500,
		function(){
			$('#room').removeClass('blur');
			$('#intro').height(0).width(0);
			$('#buffer').remove();
			$('.smoke-signs').addClass('shake');
		}
	);

});



}());
