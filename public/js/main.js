/*jslint browser: true */
/*devel: true */
/*global $, jQuery, sockets, App, templates */

function escapeHTML( string ) {
    var pre = document.createElement('pre');
    var text = document.createTextNode( string );
    pre.appendChild(text);
    return pre.innerHTML;
}

$(document).ready(function(){
	'use strict';


	$('#room').click(function(){
		templates.smoke_window(sockets.user_socket.name);
	});

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

		console.log(avatar);

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
			}
		);
	});


	$('#room').click(function(e){
		if(e.target !== this) return;
		e.preventDefault();
		e.stopPropagation();
		var $avatar = $('.current-user'),
			m_x = e.clientX - 150,
			m_y = e.clientY - 210;

		$avatar.css({
			'left'	: m_x,
			'top'	: m_y
		});

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

	$(document).on('click', '.pv', function(){
		$(this).siblings('#collabs').toggleClass('show');
	});

	$(document).on('click', '#like', function(){
		$(this).hide();
		$(this).siblings().show();
	});


	$(document).on('click', '#enter', function(){
		$('#welcome').fadeOut(400, function(){
			$('#setup').fadeIn(400, function(){
				sockets.init();
				App.init();
			});
		});
	});

	navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

	if (!navigator.getUserMedia_) {
		$('#setup').html('<h2 class="no-camera site-title sub">Please use Chrome, Firefox or Opera</h2>');
	}

	setTimeout(function(){
		$('#facebook.box').css({
			'left' 	: Math.random() * ($(window).width() - 200),
			'top'	: Math.random() * ($(window).height() - 300)
		}).show();

			setTimeout(function(){
				$('#facebook.box').hide();
			}, 30000);

	}, 120000);

});
