exports.load = function (db) {
	this.getJeux = function (callback) {
		db.connect(function() {
			var model = db.model('jeux');
			var query = model.find();
			
			query.exec(function (err, jeux) {
				db.close();
				callback(jeux);
			});
		});
	}
	
	
	this.loadUsers = function (load, callback) {
		db.connect(function() {
			var model = db.model('users');
			
			for ( var k=0; k<load.length; k++ ) {
				var elem = new model(load[k]);
				
				elem.save(function (err) {
					if (err) console.log(err);
					
					
					if ( k == (load.length) ) {
						console.log(k);
						db.close();
						callback();
					}
				});
			}
		});
	}
	
	return this;
}