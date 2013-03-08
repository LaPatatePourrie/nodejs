$(document).ready(function () {
	thisUser = false;
	
	var socket = io.connect('http://localhost:1337/jeu-barre');
	
	$('.rooms .room').live('mouseover', function () {
		if ( thisUser && thisUser.login != $(this).attr('data-host') ) {
			$(this).find('span.join').show();
		}
		else {
			$(this).find('span.delete').show();
		}
	});
	$('.rooms .room').live('mouseout', function () {
		$(this).find('span.join').hide();
		$(this).find('span.delete').hide();
	});
	$('.rooms .room').live('click', function () {
		if ( $(this).hasClass('myRoom') ) {
			socket.emit('delete', $(this).attr('data-host'), function () {
				end();
			});
		}
		else if ( !$(this).hasClass('locked') ) {
			socket.emit('join', $(this).attr('data-host'), function (user, game) {
				$('.create').addClass('inactive');
				thisPlayer = user;
				prepare(game);
			});
		}
	});
	
	$('.barres .barre.over').live('click', function () {
		var n = $(this).attr('data-n');
		var nMax = getNMax();
		var nRemove = nMax-n;
		
		socket.emit('remove', nRemove);
	});
	
	$('.create').click(function () {
		socket.emit('create', function (user, game) {
			$('.create').addClass('inactive');
			thisPlayer = user;
			$('.interface .settings').html(Mustache.render(settingsTpl, {host:user.login, player:'?', waiting:true}));
			prepare(game);
		});
	});
	
	
	
	
	var thisPlayer;
	var players = {}
	var roomTpl = $('.roomsTpl').html();
	var barreTpl = $('.barresTpl').html();
	var settingsTpl = $('.settingsTpl').html();
	
	
	/***
	* Sockets
	***/
	
	socket.on('setRooms', function (rooms) {
		updateRooms(rooms)
	});
	socket.on('starting', function (room) {
		initialize(room);
	});
	socket.on('remove', function (game) {
		var nMax = getNMax();
		for ( var i=game.remaining; i<nMax; i++ ) {
			$('.barres .barre[data-n="'+i+'"]').fadeOut(function () {
				$(this).remove();
			});
		}
		updateGame(game);
	})
	
	socket.on('defeat', function () {
		feedback('defeat');
		socket.emit('endGame');
	});
	socket.on('victory', function () {
		feedback('victory');
		socket.emit('endGame');
	});
	
	socket.on('disconnectedPlayer', function () {
		$('.interface').addClass('disconnection');
		feedback('disconnectedPlayer');
	});
	socket.on('disconnectedHost', function () {
		$('.interface').addClass('disconnection');
		feedback('disconnectedHost');
	});
	
	
	
	
	// Functions
	
	function updateRooms (rooms) {
		$('.rooms .room').remove();
			
		var flagFull = false;
		var flagOpened = false;
		$('.rooms .full').show();
		$('.rooms .full .content').html('');
		$('.rooms .opened .content').html('');
		
		for ( host in rooms) {
			nPlayer = _.size(rooms[host].game.players.users);
			nMaxPlayer = rooms[host].game.param.nPlayer;
			
			// Rooms pleines
			if ( nPlayer == nMaxPlayer ) {
				$('.rooms .full .content').append(Mustache.render(roomTpl, {host:host}));
				$room = $('.room[data-host="'+host+'"]');
				$room.addClass('locked');
				flagFull = true;
			}
			// Rooms ouvertes
			else {
				$('.rooms .opened .content').append(Mustache.render(roomTpl, {host:host}));
				$room = $('.room[data-host="'+host+'"]');
				flagOpened = true;
			}
			// C'est ma room
			if ( thisUser.login == host ) {
				$room.addClass('myRoom');
			}
			$room.find('span.players').html('('+nPlayer+'/'+nMaxPlayer+')');
		}
			
		// Aucune room pleines
		if ( !flagFull ) {
			$('.rooms .full').hide();
		}
		if ( !flagOpened ) {
			$('.rooms .opened .content').html('Aucune room n\'est disponible.');
		}
	}
	
	function getNMax () {
		n = 0;
		for ( i=0; i<20; i++ ) {
			if ( $('.barres .barre[data-n="'+i+'"]').length > 0 ) {
				n = i;
			}
			else {
				break;
			}
		}
		return n+1;
	}
	
	function prepare (game) {
		$('.interface').removeClass('hidden');
		$('.feedback').hide();
		$('.barres .barre').remove();
		for ( var i=0; i<game.param.nMax; i++ ) {
			$('.barres').append(Mustache.render(barreTpl, {n:i}));
		}
	}
	function updateGame (game) {
		for ( var i=game.remaining; i>game.remaining-4; i-- ) {
			$('.barres .barre[data-n="'+i+'"]').bind('mouseover', function () {
				for ( var j=$(this).attr('data-n'); j<game.remaining; j++ ) {
					$('.barres .barre[data-n="'+j+'"]').addClass('over');
				}
			});
			$('.barres .barre[data-n="'+i+'"]').bind('mouseout', function () {
				for ( var j=$(this).attr('data-n'); j<game.remaining; j++ ) {
					$('.barres .barre[data-n="'+j+'"]').removeClass('over');
				}
			});
		}
		
		if ( game.turn == thisPlayer.login ) {
			$('.arrow').addClass('myTurn');
			$('.arrow').removeClass('notMyTurn');
		}
		else {
			$('.arrow').addClass('notMyTurn');
			$('.arrow').removeClass('myTurn');
		}
	}
	
	function end() {
		$('.create').removeClass('inactive');
		$('.arrow').removeClass('myTurn');
		$('.arrow').removeClass('notMyTurn');
		$('.interface').addClass('endGame');
	}
	
	function initialize (room) {
		$('.interface').removeClass('endGame disconnection hidden');
		
		$('.feedback').hide();
		
		updateGame(room.game);
		$('.settings').fadeIn();
		$('.settings').html(Mustache.render(settingsTpl, {host:room.host, player:room.otherPlayer, waiting:false}));
		$('.settings .waiting').hide();
	}
	
	function feedback(feed) {
		$('.feedback').removeClass('defeat victory info error');
		
		switch ( feed ) {
			case 'defeat' :
				var out = 'Dommage, c\'est perdu...';
				$('.feedback').addClass('defeat');
				break;
			case 'victory' :
				var out = 'Bravo, c\'est gagn&eacute; !';
				$('.feedback').addClass('victory');
				break;
			case 'disconnectedHost' :
				var out = 'L\'host de la partie a &eacute;t&eacute; d&eacute;connect&eacute;.';
				$('.feedback').addClass('error');
				break;
			case 'disconnectedPlayer' :
				var out = 'Votre adversaire a &eacute;t&eacute; d&eacute;connect&eacute;.';
				$('.feedback').addClass('error');
				break;
		}
		$('.feedback').html(out);
		$('.feedback').show();
		
		end();
	}
});