exports.load = function (db) {
	this.getMessages = function (users, callback) {
		var messages = [];
		db.connect(function () {
			var model = db.model('chatMessages');
			var query = model.find(null);
			
			query.exec(function (err, mess) {
				if (err) { throw err; }
				for (var i = 0, l = mess.length; i < l; i++) {
					var message = {};
					message.user = users.get(mess[i].auteur);
					message.contenu = mess[i].contenu;
					messages.push(message);
				}
				db.close();
				callback(messages);
			});
		});
	}
	
	this.saveMessage = function (message) {
		db.connect(function () {
			var model = db.model('chatMessages');
			var messageModel = new model({ auteur : message.user.login, contenu:message.contenu, date:message.date });
			messageModel.save(function (err) {
				if (err) { throw err; }
				db.close();
			});
		});
	}
	
	this.deleteMessages = function () {	
		db.connect(function () {
			var model = db.model('chatMessages');
			model.remove(null, function (err) {
				if (err) { throw err; }
				db.close();
			});
			console.log('Messages du chat supprimés');
		});
	}
	return this;
}