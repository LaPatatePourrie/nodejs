exports.Users = function () {
	return new Users();
}
exports.User = function (data) {
	if ( _.isUndefined(data) ) {
		return false;
	}
	return new User(data);
}
exports.defaultUser = function () {
	return new User({
						login 		: 'Anonymous', 
						password 	: false, 
						statut		: 5,
						logged 		: false
					});
}

function Users () {
	this.users = {};
	
	this.exists = function (login) {
		if ( this.users[login] ) {
			return true;
		}
		return false;
	}
	this.match = function (login, passwd) {
		for ( var key in this.users ) {
			if ( this.users[key].login == login && this.users[key].passwd == passwd ) {
				return this.users[login];
			}
		}
		return false;
	}
	this.correctLogin = function (login) {
		if ( login.length >= 2 && login.length <= 20 ) {
			return true;
		}
		return false;
	}
	this.correctPasswd = function (login) {
		if ( login.length >= 5 && login.length <= 15 ) {
			return true;
		}
		return false;
	}
	this.add = function (user) {
		this.users[user.login] = user;
		return this;
	}
	this.remove = function (user) {
		this.users = _.omit(this.users, user.login);
		return this;
	}
	this.get = function (login) {
		return this.users[login];
	}
	this.getAll = function () {
		return this.users;
	}
	this.count = function () {
		return _.size(this.users);
	}
	this.random = function () {
		var n = _.random(0, _.size(this.users)-1);
		var i = 0;
		for ( login in this.users ) {
			if ( i == n ) {
				return this.users[login];
			}
			i++;
		}
		return false;
	}
	this.getLogged = function () {
		var users = {};
		
		for ( var login in this.users ) {
			if ( this.get(login).isLogged() ) {
				users[login] = this.get(login);
			}
		}
		return users;
	}
	this.countLogged = function () {
		var count = 0;
		_.each(this.users, function (item) {
			if ( item.isLogged() ) {
				count++;
			}
		});
		return count;
	}
}


function User (data) {
	this.login;
	this.passwd;
	this.statut;
	this.logged;
	this.dateLastLog;
	this.firstConnection;
	this.options = {hide:[], restrict:[]};
	
	for ( key in data ) {
		this[key] = data[key];
	}
	
	this.log = function () {
		if ( this.login != 'Anonymous' ) {
			this.logged = true;
			this.dateLastLog = new Date();
		}
	}
	this.unlog = function () {
		this.logged = false;
	}
	this.isLogged = function () {
		return this.logged;
	}
	this.isLogged = function () {
		return this.logged;
	}
	this.getLogDuration = function () {
		var today = new Date();
		var diff = today - this.dateLastLog;
		date = diff.getSeconds();
		
		return date;
	}
	this.isAuthorized = function (ctrlStatut) {
		if ( this.statut <= ctrlStatut || ctrlStatut == 5 ) {
			return true;
		}
		return false;
	}
}








