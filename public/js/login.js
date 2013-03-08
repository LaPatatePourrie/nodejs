$(document).ready(function () {
	var socket = io.connect('http://localhost:1337/login', {
            'connect timeout': 500,
            'reconnect': true,
            'reconnection delay': 500,
            'reopen delay': 500,
            'max reconnection attempts': 10
    });
	
	
	
	
	$('#connexion .login input[name="passwd"]').enter(function () {
		var login = $('#connexion .login input[name="login"]').val();
		var passwd = $('#connexion .login input[name="passwd"]').val();
		
		socket.emit('login', {
				login : login,
				passwd : passwd
			},
			function () {
				$('#connexion').fadeOut(function () {
					$(this).find('.box.login form').submit();
				});
			}
		);
	});
	$('.box.register .title').click(function () {
		$(this).parent().find('.form').slideToggle();
	});
	
	$('.box.register .bouton_submit').click(function () {
		socket.emit('register', {
				login   	: $(this).parent().find('input[name="login"]').val(),
				passwd   	: $(this).parent().find('input[name="passwd"]').val()
			}	
			, 
			function (user) {
				$('.box.register').slideUp(function () {
					feedback('success', 'login', 'newUser', user.login)
					$('.box.login input[name="login"]').val(user.login);
					$('.box.login input[name="passwd"]').focus();
				});
				$('.box.login input').val('');
				$('.box.login input[name="login"]').focus();
			}
		);
	});
	$('.box.register input[name="passwd"]').enter(function () {$('.box.register .bouton_submit').trigger('click')});
	
	socket.on('uncorrectDatas', 	function (data) { feedback('error', 'login', 'uncorrecDatas');});
	socket.on('loginAlreadyExists', function (data) { feedback('error', 'register', 'loginAlreadyExists'); });
	socket.on('uncorrectLogin', 	function (data) { feedback('error', 'register', 'uncorrectLogin'); });
	socket.on('uncorrectPasswd', 	function (data) { feedback('error', 'register', 'uncorrectPasswd'); });
});


function feedback(flag, box, type, data) {
	var feed = {
		'uncorrecDatas' 		: 'Informations incorrectes',
		'alreadyLogged' 		: 'Cet utilisateur est d&eacute;j&agrave; connect&eacute;',
		'loginAlreadyExists' 		: 'Ce login est d&eacute;j&agrave; utilis&eacute; par un autre utilisateur',
		'uncorrectLogin'		: 'Le login est incorrect (entre 2 et 20 caract&egrave;res)',
		'uncorrectPasswd'		: 'Le mot de passe est incorrect (entre 5 et 15 caract&egrave;res)',
		'newUser'			: 'Bienvenue <strong>'+data+'</strong>, vous pouvez d&egrave;s &agrave; pr&eacute;sent vous connecter'
	}
	$('#connexion .box.'+box+' .feedback').fadeOut(100, function () {
		$(this).html(feed[type]);
		$(this).attr('data-flag', flag);
	}).fadeIn();
}
