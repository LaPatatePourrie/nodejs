this.statut = 4;

exports.load = function (param, callback) {
	var jeu = param.url[0];
	var path = '/public/jeux/'+jeu;
	
	param.js.push('../jeux/'+jeu+'/'+jeu);
	param.css.push('../jeux/'+jeu+'/'+jeu);
	
	param.main.tpl.path = path;
	param.main.tpl.jeu = jeu;
	
	callback(param);
}

exports.sockets = function (param) {
	var io = param.io;
	var model = param.model;
	var socks = {};
	// param.socketAuthorization();
	
	
	function Rooms () {
		this.rooms = {};
		
		this.add = function (room) {
			this.rooms[room.host] = room;
			return this;
		}
		this.get = function (host) {
			return this.rooms[host];
		}
		this.getAll = function () {
			return this.rooms;
		}
		this.count = function () {
			return _.size(this.rooms);
		}
		this.remove = function (host) {
			this.rooms = _.omit(this.rooms, host);
			io.of('/jeu-barre').emit('setRooms', this.getAll());
			myRoom = false;
		}
		this.endGame = function (host) {
			this.remove(host);
		}
		this.disconnection = function (host, user) {
			otherPlayer = this.get(host).game.getOtherPlayer(user);
			if ( otherPlayer ) {
				if ( this.get(host).isHost(user) ) {
					socks[otherPlayer].emit('disconnectedHost');
				}
				else {
					socks[otherPlayer].emit('disconnectedPlayer');
				}
			}
			this.remove(host);
		}
	}
	
	function Room (hostLogin) {
		this.id;
		this.host = hostLogin;
		this.otherPlayer;
		this.game = new game();
		this.game.players.add(users.get(hostLogin));
		
		this.changeTurn = function () {
			for ( login in this.players.getAll() ) {
				if ( this.turn != login ) {
					this.turn = login;
					break;
				}
			}
		}
		this.isHost = function (userLogin) {
			if ( userLogin == this.host ) {
				return true;
			}
			return false;
		}
		this.isFull = function () {
			if ( this.game.players.count() == this.game.param.nPlayer ) {
				return true;
			}
			return false;
		}
		this.getSockets = function (func) {
			for ( login in this.game.players.getAll() ) {
				func(socks[login]);
			}
		}
	}
	
	function game () {
		this.state = 'off';
		this.param = {
						nPlayer		: 2,
						nMax		: 9
					};
		this.players = libUsers.Users();
		this.turn;
		this.remaining;
		
		this.changeTurn = function () {
			for ( login in this.players.getAll() ) {
				if ( this.turn != login ) {
					this.turn = login;
					break;
				}
			}
		}
		this.start = function () {
			this.remaining = this.param.nMax;
			this.turn = this.players.random().login;
			this.remaining = this.param.nMax;
			this.state = 'on';
		}
		this.isOn = function () {
			if ( this.state == 'on' )
				return true;
			return false;
		}
		this.end = function () {
			this.state = 'off';
			this.players = libUsers.Users();
		}
		this.check = function () {
			if ( this.players.count() != this.param.nPlayer ) {
				this.state == 'off';
				return false;
			}
			return true;
		}
		this.myTurn = function (user) {
			if ( this.turn == user ) {
				return true;
			}
			return false;
		}
		this.getOtherPlayer = function (thisUserLogin) {
			for ( login in this.players.getAll() ) {
				if ( login != thisUserLogin ) {
					return login;
				}
			}
			return false;
		}
		this.isPlaying = function (login) {
			return this.players.get(login);
		}
	};
	
	
	var libUsers = lib.users;
	var users = libUsers.Users();
	var rooms = new Rooms();
	
	
	
	
	
	io.of('/jeu-barre').on('connection', function (socket) {
		// Variables de l'utilisateur
		var thisUser;
		var myRoom = false;
		var sessionID = socket.handshake.sessionID;
		
		var user = users.get(socket.handshake.user.login);
		// Utilisateur déjà loggé
		if ( user ) {
			thisUser = user;
		}
		// Utilisateur qui se logg
		else {
			thisUser = new libUsers.User(socket.handshake.user);
			users.add(thisUser);
		}
		
		// Init
		socks[thisUser.login] = socket;
		io.of('/jeu-barre').emit('setRooms', rooms.getAll());
		
		
		
		// Création d'une partie
		socket.on('create', function (callback) {
			if ( !myroom() && thisUser.isLogged() ) {
				myRoom = new Room(thisUser.login);
				myRoom.game.players.add(thisUser);
				rooms.add(myRoom);
				
				io.of('/jeu-barre').emit('setRooms', rooms.getAll());
				callback(thisUser, myRoom.game);
			}
			else {
				console.log('Deja en jeu');
			}
		});
		
		// Rejoindre une partie
		socket.on('join', function (host, callback) {
			if ( !myroom() && thisUser.isLogged() ) {
				for ( _host in rooms.getAll() ) {
					if ( _host == host ) {
						thisRoom = rooms.get(host);
						break;
					}
				}
				if ( !thisRoom.isFull() ) {
					myRoom = thisRoom;
					myroom().game.players.add(thisUser);
					myroom().otherPlayer = thisUser.login;
					
					console.log('Room '+myroom().host+' joined by '+thisUser.login+' / nbJoueur : '+myroom().game.players.count());
					io.of('/jeu-barre').emit('setRooms', rooms.getAll());
					callback(thisUser, myroom().game);
					
					// Game is starting
					if ( myroom().game.check() ) {
						myroom().game.start();
						myroom().getSockets(function(socket) {
							socket.emit('starting', myroom());
						});
					}
				}
			}
			else {
				console.log('Deja en jeu');
			}
		});
		
		// Jouer
		socket.on('remove', function (nRemove) {
			if ( myroom() && myroom().game.check() ) {
				if ( myroom().game.myTurn(thisUser.login) ) {
					myroom().game.remaining -= nRemove;
					myroom().game.changeTurn();
					myroom().getSockets(function (socket) {
						socket.emit('remove', myroom().game);
					})
					
					var ended = false;
					if ( myroom().game.remaining == 1 ) {
						ended = true;
						thisUserResult = 'victory';
						otherUserResult = 'defeat';
					}
					else if ( myroom().game.remaining == 0 ) {
						ended = true;
						thisUserResult = 'defeat';
						otherUserResult = 'victory';
					}
					
					// Le jeu est fini
					if ( ended ) {
						socket.emit(thisUserResult);
						
						otherPlayer = myroom().game.getOtherPlayer(thisUser.login);
						if ( otherPlayer ) {
							socks[otherPlayer].emit(otherUserResult);
						}
						rooms.endGame(myRoom.host);
						io.of('/jeu-barre').emit('setRooms', rooms.getAll());
					}
				}
			}
		});
		
		socket.on('delete', function (host, callback) {
			rooms.disconnection(host, host);
			io.of('/jeu-barre').emit('setRooms', rooms.getAll());
			callback();
		});
		
		
		// Déconnexion brutale de la partie
		socket.on('disconnect', function () {
			if ( myroom() ) {
				rooms.disconnection(myRoom.host, thisUser.login);
			}
		});
		
		function myroom () {
			return rooms.get(myRoom.host);
		}
	});
}
