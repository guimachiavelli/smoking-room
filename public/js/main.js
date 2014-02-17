/*jslint browser: true */
/*devel: true */
/*global $, jQuery, sockets, App */

$(document).ready(function(){
	'use strict';

	sockets.init();

	App.init();

	$('#room').click(function(){
		templates.smoke_window(sockets.user_socket.name);
	});

	var $readyBtn = $('#ready-go');
	$readyBtn.click(function(){
		var avatar = App.chooseAvatar(),
			username = $('#username').val(),
			x = Math.random() * 1000,
			y = Math.random() * (window.innerHeight - 420);
		var data = {
			'avatar' : avatar,
			'username' : username,
			'pos' : [x,y]
		};

		if (!avatar || !username) {
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
			}
		);
		$('#buffer').remove();
		sockets.user_socket.name = username;
	});


	$('#room').click(function(e){
		var $avatar = $('.current-user'),
			m_x = e.clientX - 150,
			m_y = e.clientY - 210;

		$avatar.css({
			'left'	: m_x,
			'top'	: m_y
		});

		console.log(sockets.user_socket);

		sockets.socket.emit('user move', { username: sockets.user_socket.name, new_pos: [m_x, m_y]});
	});



	$(document).on('click', '.chat-hide', function(){
		$(this).parents('.chat-window').toggleClass('hidden');
		if ($(this).text() === 'Hide') {
			$(this).text('Show');
		} else {
			$(this).text('Hide');
		}
	});




});
