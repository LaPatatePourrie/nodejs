exports.load = function (db) {
	var defaultStatut = 4;
	var libUsers = require('../../../library/Users.js');
	
	this.getUsers = function (callback) {
		var users = libUsers.Users();
		db.connect(function () {
			var model = db.model('users');
			var query = model.find(null);
			query.exec(function (err, usrs) {
				if (err) { throw err; }
				for (var i = 0, l = usrs.length; i < l; i++) {
					var user = libUsers.User({
												login 		: usrs[i].login, 
												passwd		: usrs[i].passwd, 
												statut 		: usrs[i].statut
											});
					users.add(user);
				}
				db.close();
				
				if ( callback )
					callback(users);
			});
		});
	}
	
	this.register = function (user, callback) {
		db.connect(function () {
			var model = db.model('users');
			var toSave = new model({
				login	: user.login,
				passwd	: user.passwd,
				statut 	: defaultStatut
			});
			toSave.save(function (err) {
				if (err) { throw err; }
				db.close();
				if ( callback ) 
					callback();
			});;
		});
	}
	return this;
}