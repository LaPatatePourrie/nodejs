var db = require('../../library/db/mongodb/db').load('node');
var libUsers = require('../../library/Users');


exports.load = function (param) {
	if ( _.isUndefined(param.req.session.user) || !param.req.session.user ) {
		var user = libUsers.defaultUser();
		user.logged = false;
		param.req.session.user = user;
	}
	else {
		var user = new libUsers.User(param.req.session.user);
	}
	
	var pack = getPackage(param.pack, param.office);
	
	
	// Le controller n'existe pas
	if ( !pack.exists ) {
		param.res.redirect('/');
	}
	// Le controller existe
	else {
		// L'utilisateur n'est pas autorisé à voir cette pages
		if ( !user.isAuthorized(pack.ctrl.statut) ) {
			param.req.session.redirect = param.req.url;
			param.res.redirect('/login/nonAuthorized');
		}
		else {
			param.user = user;
			param.js = [];
			param.css = [];
			
			param.main = pack;
			param.module = {};
			
			// Utilisable dans les controllers pour charger un module
			param.loadModule = function (moduleName) {
				var module = getPackage(moduleName, 'modules');
				module.user = user;
				module.js = [];
				module.css = [];
				param.module[moduleName] = module;
				param.module[moduleName].ctrl.load(module);
			}
			
			
			// Chargement du controller principal
			param.main.ctrl.load(param, function (param) {
				// Modules permanents
				param.loadModule('chat');
				param.loadModule('connection');
				
				// Insertion des scripts JS et CSS des modules
				for ( mod in param.module ) {
					if ( param.module[mod].js ) {
						for ( i in param.module[mod].js ) {
							param.js.push(param.module[mod].js);
						}
					}
					if ( param.module[mod].css ) {
						for ( i in param.module[mod].css ) {
							param.css.push(param.module[mod].css);
						}
					}
				}
				
				// Script du back et front-office
				if ( param.office == 'back' ) {
					param.js.push('back');
					param.css.push('back');
				}
				else if ( param.office == 'front' ) {
					param.js.push('main');
					param.css.push('main');
				}
				
				
				// Génération de la page
				// console.log(param);
				param.res.render('layout/index', param);
			});
		}
	}
}

exports.sockets = function (param) {
	var allCtrl = {
		'front' 	 : [
						'login',
						'jeu',
						'accueil'
				],
		'back' 	 : [
						'lamd'
				],
		'modules' : [
						'chat',
						'connection'
				 ]
	};
	
	param.io.set('log level', 1);
	
	
	param.socketAuthorization = function () {
		// Modules
		param.io.of('/chat').authorization(function (handshakeData, callback) {authorization(param, handshakeData, callback);});
		// Jeux
		param.io.of('/jeu-barre').authorization(function (handshakeData, callback) {authorization(param, handshakeData, callback);});
		// Jeux
		param.io.of('/module').authorization(function (handshakeData, callback) {authorization(param, handshakeData, callback);});
	}
	
	param.getThisUser = function (socket, libUsers) {
		var user = libUsers.Users().get(socket.handshake.user.login);
		if ( user ) {
			thisUser = user;
		}
		else {
			thisUser = new libUsers.User(socket.handshake.user);
		}
		return thisUser;
	}
	
	for (var type in allCtrl) {
		for ( var i in allCtrl[type] ) {
			var pack = getPackage(allCtrl[type][i], type);
			
			param.model = pack.model;
			var ctrl = require(pack.ctrl.path).sockets(param);
		}
	}
}


// Objets



var authorization = function (param, handshakeData, callback) {
	var parseCookie = require('connect').utils.parseCookie;
	var cookies = parseCookie(handshakeData.headers.cookie);
	var sessionID = cookies['connect.sid'];
	
	if ( !sessionID ) {
		callback('No session', false);
	} 
	else {
		handshakeData.sessionID = sessionID;
		param.app.sessionStore.get(sessionID, function (err, session) {
			if (!err && session && session.user) {
				handshakeData.user = session.user;
				callback(null, true);
			} 
			else {
				callback(err || 'User not authenticated', false);
			}
		});
	}
}

var getPackage = function (packName, type) {
	var pack = {};
	pack.tpl = {};
	pack.pack = packName;
	
	ctrlPath = getPath(packName, 'ctrl', type);
	
	if ( fs.existsSync(ctrlPath) ) {
		pack.template = type;
		pack.exists = true;
		pack.type = type;
	}
	else {
		pack.exists = false;
	}
	
	// Le Controller existe
	if ( pack.exists ) {
		pack.ctrl = require(ctrlPath);
		pack.ctrl.path = ctrlPath;
		
		var modelPath = getPath(packName, 'model', type);
		
		if ( fs.existsSync(modelPath) ) {
			pack.model = require(modelPath).load(db);
		}
		else {
			pack.model = false;
		}
	}
	
	return pack;
}

var getPath = function (packName, app, category) {
	var appName;
	
	switch ( app ) {
		case 'ctrl' : appName = 'controllers';
			break;
		case 'model' : appName = 'models';
			break;
		case 'view' : appName = 'views';
			break;
	}
		
	var path = pwd+'/application/'+appName+'/'+category+'/'+packName+'.'+app+'.js';
	return path;
}



