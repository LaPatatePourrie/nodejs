this.statut = 5;

exports.load = function (module) {
	module.js.push('login');
}


exports.sockets = function (param) {
	var model = param.model;
	var io = param.io;
	var users;
	
	io.of('/login').on('connection', function (socket) {
		var thisUser = false;
		
		socket.on('login', function (data, callback) {
			model.getUsers(function (users) {
				if ( !thisUser ) {
					var user = users.match(data.login, data.passwd);
					if ( !user ) {
						socket.emit('uncorrectDatas');
					}
					else {
						if ( !user.isLogged() ) {
							thisUser = user;
							console.log(thisUser.login+' is logged');
							users.get(thisUser.login).log();
							callback();
						}
						else {
							socket.emit('alreadyLogged');
						}
					}
				}
			});
		});
	
		
		socket.on('register', function (user, callback) {
			model.getUsers(function (users) {
				console.log('Enregistrement de '+user.login+'...');
				
				if ( users.exists(user.login) ) {
					socket.emit('loginAlreadyExists')
				}
				else if ( !users.correctLogin(user.login) ) {
					socket.emit('uncorrectLogin')
				}
				else if ( !users.correctPasswd(user.passwd) ) {
					socket.emit('uncorrectPasswd')
				}
				else {
					model.register(user, function () {
						console.log('Nouvel utilisateur enregistred : '+user.login+' - Mot de passe : '+user.passwd);
						callback(user);
					});
				}
			});
		});
	});
}
