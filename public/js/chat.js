
var thisUser = {
	options : {
		hide : [],
		restrict : []
	}
};

$(document).ready(function () {
	var socket = io.connect('http://localhost:1337/chat', {
		'connect timeout': 500,
		'reconnect': true,
		'reconnection delay': 500,
		'reopen delay': 500,
		'max reconnection attempts': 10
     });
	
	
	var msgtpl = $('.message.tpl').html();
	
	
	
	
	$('#chat').find('.overlay .button').live('click', function () {
		$('#connexion').fadeIn();
	});
	
	$('#chat .form').enter(function () {
		if ( $('#chat .form [name="message"]').val() != '' ) {
			var message = {
				contenu		: $('#chat .form').find('[name="message"]').val()
			}
			socket.emit('newmsg', message, function () {
				$('#chat .form [name="message"]').val('');
				$('#chat .form [name="message"]').focus();
			});
		}
	});
	
	$('#chat li.user').live('click', function () {
		if ( $(this).attr('data-user') != thisUser.login ) {
			if ( $(this).hasClass('selected') ) {
				finalClass = false;
			}
			else {
				finalClass = true;
			}
			$('#chat li.user.selected').removeClass('selected');
			
			if ( finalClass ) {
				$('#chat .users .options').show();
				$(this).addClass('selected');
			}
			else {
				$('#chat .users .options').hide();
			}
		}
	});
	
	$('#chat li.user').live('mouseover', function () {
		if ( $(this).attr('data-user') != thisUser.login ) {
			$(this).find('.options').show();
		}
	});
	
	$('#chat .users .options span').live('click', function () {
		var option = $(this).attr('data-option');
		var user = $('#chat .users li.user.selected').attr('data-user');
		
		if ( _.contains(thisUser.options[option], user) ) {
			$('#chat .users li.user[data-user="'+user+'"]').removeClass(option);
			cancel = true;
			thisUser.options[option] = _.without(thisUser.options[option], user);
		}
		else {
			$('#chat .users li.user[data-user="'+user+'"]').addClass(option);
			cancel = false;
			thisUser.options[option].push(user);
		}
		
		updateChatMessages();
		
		socket.emit('option', {
			value		: option,
			user 		: user,
			cancel		: cancel
		});
	});
	
	// Déconnexion de l'utilisateur
	$('#topbar .user .disconnect').live('click', function () {
		socket.emit('deconnexion', function () {
			window.location = '/login/deconnexion';
		});
	});
	
	
	$('#chat .overlay').live('click', function () {
		$('#front #connexion').fadeIn();
		$('#front #connexion .box.login input[name="login"]').focusend();
	});
	
	
	
	/**
	* Sockets
	**/
	
	var messageHistory = [];
	
	
	socket.on('newusr', function (data) {
		if ( data.logInChat ) {
			$('#chat .messages').append('<div class="feed">'+data.user.login+' vient de se connecter.</div>')		
		}
		updateUsers(data.users);
	});
	socket.on('setThisUser', function (user) {
		thisUser = user;
		updateOptions();
	});
	
	socket.on('newmsg', function (message) {
		messageHistory.push(message);
		
		className = '';
		if ( messageHistory.length > 1 && messageHistory[messageHistory.length-2].user.login == message.user.login ) {
			className = 'same';
		}
		$('#chat .messages').append(Mustache.render(msgtpl, {auteur:message.user.login, message:message.contenu, className:className}));
		chatScrollBottom();
		
		updateChatMessages();
	});
	
	socket.on('disusr', function (data) {
		$('#chat .user.'+data.user.login).fadeOut();
		
		updateUsers(data.users);
		
		$('#chat .users ul.users li[data-user="'+data.user.login+'"]').remove();
		$('#chat .messages').append('<div class="feed">'+data.user.login+' vient de se d&eacute;connecter.</div>')
	});
	
	socket.on('disable', function () {
		$('#chat .overlay').show();
	});
});





function updateOptions () {
	for ( var i in thisUser.options.hide ) {
		$('#chat .users li.user[data-user="'+thisUser.options.hide[i]+'"]').removeClass('restrict');
		$('#chat .users li.user[data-user="'+thisUser.options.hide[i]+'"]').addClass('hide');
	}
	for ( var i in thisUser.options.restrict ) {
		$('#chat .users li.user[data-user="'+thisUser.options.restrict[i]+'"]').removeClass('hide');
		$('#chat .users li.user[data-user="'+thisUser.options.restrict[i]+'"]').addClass('restrict');
	}
	
	$('#chat .users li.user[data-user="'+thisUser.login+'"]').addClass('me');
}
function updateChatMessages () {
	$('#chat .messages .message').show();
	
	for ( var i in thisUser.options.hide ) {
		$('#chat .messages .message[data-auteur="'+thisUser.options.hide[i]+'"]').hide();
	}
	
	if ( thisUser.options.restrict.length > 0 ) {
		$('#chat .messages .message').hide();
		$('#chat .messages .message[data-auteur="'+thisUser.login+'"]').show();
		for ( var i in thisUser.options.restrict ) {
			$('#chat .messages .message[data-auteur="'+thisUser.options.restrict[i]+'"]').show();
		}
	}
	
	
	$('#chat .messages .message[data-auteur="'+thisUser.login+'"]').addClass('me');
	$('#chat .messages .message.tpl').hide();
}

function updateUsers(users) {
	var usertpl = $('#chat .users ul.tpl').html();
	$('#chat .users ul.users').html('');
	
	for ( var i in users ) {
		$('#chat .users ul.users').append(Mustache.render(usertpl, {login:users[i].login}));
	}
	$('#chat .users li.user[data-user="'+thisUser.login+'"]').remove();
	$('#chat .users ul.users').prepend(Mustache.render(usertpl, {login:thisUser.login}));
	updateOptions();
}

function chatScrollBottom() {
	$scrollable = $('#chat .messages');
	scroll = $scrollable.prop('scrollHeight');
	$scrollable.prop('scrollTop', scroll);
}
function updateLogDuration(users) {
	for ( var i in users ) {
		user = users[i];
		// diff = getLogDuration(user.dateLastLog);
		// $('#chat .users ul.users li[data-user="'+user.login+'"] .duration span').html(diff);
	}
}
function getLogDuration(dateDebut) {
	today = new Date();
	dateDebut = new Date(dateDebut);
	var diff = (today - dateDebut)/1000;
	
	sec = Math.floor(diff);
	min = Math.floor(diff/60);
	hour = Math.floor(diff/60/60);
	day = Math.floor(diff/60/60/24);
	
	var str = '';
	if ( day > 0 ) {
		str += day+' jours ';
		hour = hour%24;
	}
	if ( hour > 0 ) {
		str += hour+' heures ';
		min = min%60;
	}
	if ( min > 0 ) {
		str += min+' min ';
		sec = sec%60;
	}
	else if ( sec > 0 ) {
		str += sec+' sec ';
	}
	
	return str;
}
	
function feedback(flag, box, type, data) {
	var feed = {
		'uncorrecDatas' 		: 'Informations incorrectes',
		'alreadyLogged' 		: 'Cet utilisateur est d&eacute;j&agrave; connect&eacute;',
		'loginAlreadyExists' 	: 'Ce login est d&eacute;j&agrave; utilis&eacute; par un autre utilisateur',
		'uncorrectLogin'		: 'Le login est incorrect (entre 2 et 20 caract&egrave;res)',
		'uncorrectPasswd'		: 'Le mot de passe est incorrect (entre 5 et 15 caract&egrave;res)',
		'newUser'		: 'Bienvenue <strong>'+data+'</strong>, vous pouvez d&egrave;s &agrave; pr&eacute;sent vous connecter'
	}
	$('#connexion .box.'+box+' .feedback').fadeOut(100, function () {
		$(this).html(feed[type]);
		$(this).attr('data-flag', flag);
	}).fadeIn();
}
