this.statut = 5;

exports.load = function (module) {
	module.js.push('chat');
};

exports.sockets = function (param) {
	var model = param.model;
	var io = param.io;
	
	param.socketAuthorization();
		
	var users = lib.users.Users();
	var messages = new Array();
	
	
	io.of('/chat').on('connection', function (socket) {
		var sessionID = socket.handshake.sessionID;
		var thisUser = param.getThisUser(socket, lib.users);
		if ( !users.get(thisUser.login) ) users.add(thisUser);
		users.get(thisUser.login).log();
		
		
		if ( !users.get(thisUser.login).isLogged() ) {
			socket.emit('disable');
		}
		else {
			socket.emit('setThisUser', thisUser);
			
			io.of('/chat').emit('newusr', {
				logInChat		 	: users.get(thisUser.login).firstConnection,
				user 				: thisUser,
				users				: users.getLogged()
			});
			
			if ( users.get(thisUser.login).firstConnection ) {
				users.get(thisUser.login).firstConnection = false;
			}
			
			// Chargement des messages
			for ( var i in messages ) {
				socket.emit('newmsg', messages[i]);
			}
		
			// Nouveau message
			socket.on('newmsg', function (message, callback) {
				var date = new Date();
				message.user = thisUser;
				message.date = date;
				message.h = date.getHours();
				message.m = date.getMinutes();
			
				io.of('/chat').emit('newmsg', message);
				messages.push(message);
				callback();
			});
			
			// Options du chat
			socket.on('option', function (option, callback) {
				if ( option.cancel ) {
					users.get(thisUser.login).options[option.value] = _.without(thisUser.options[option.value], option.user);
				}
				else {
					users.get(thisUser.login).options[option.value].push(option.user);
				}
			});
		
			// Déconnexion
			socket.on('deconnexion', function (callback) {
				console.log('Removing '+thisUser.login+' > '+thisUser);
				users.remove(thisUser);
				io.of('/chat').emit('disusr', {
					user   	: thisUser,
					users	: users.getLogged()
				});
				
				if ( _.size(users.getLogged()) == 0 ) {
					messages = new Array();
				}
				callback();
			});
			
			socket.on('set', function () {
				users.get(thisUser.login).isset = 'seted';
			});
		}
	});
}
