var mongoose = require('mongoose');
var schema = require('./schema').load(mongoose);

exports.load = function (dbName) {
	var db = new database(dbName, schema, mongoose);
	db.close();
	return db;
}

function database(dbName, schema, mongoose) {
	this.mongoose = mongoose;
	this.schema = schema;
	this.dbName = dbName;
	this.flag = true;
	
	this.connect = function (callback) {
		this.flag = false;
		this.mongoose.connect('mongodb://localhost/'+dbName, function(err) {
			if (err) { throw err; }
			callback();
		});
	}
	this.close = function () {
		var self = this;
		this.mongoose.connection.close(function (err) {
			if (err) { throw err; }
			self.flag = true;
		});
	}
	this.model = function(model) {
		return this.mongoose.model(model, this.schema[model]);
	}
}
