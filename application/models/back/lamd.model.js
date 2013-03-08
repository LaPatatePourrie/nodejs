exports.load = function (db) {
	var libUsers = require('../../../library/Users.js');
	this.module = false;
	
	/*****
	***	Elem (modification)
	*****/
	this.getElem = function (param, callback) {
		var self = this;
		var module = this.module;
		
		db.connect(function () {
			var model = db.model(param.table);
			var args = {_id 	: param.id };
			
			model.find(args, function (err, data) {
				if (err) console.log(err);
				db.close();
				data = self.restrForExtract(data[0], module);
				callback(data);
			});
		});
	}
	
	this.getElems = function (params, callback) {
		var self = this;
		
		db.connect(function () {
			var datas = [];
			
			var incr = 0;
			
			for ( var n=0; n<params.length; n++ ) {
				query(params[n]);
			}
			
			if ( params.length == 0 ) {
				db.close();
				callback(false, {});
			}
			
			function query(param) {
				var model = db.model(param.dynamic.table);
				
				var where = {_id : param.id};
				var query = model.find(where);
				
				query.exec(function (err, data) {
					if (err) console.log(err);
					var infos = {};
					infos.data = {};
					if ( typeof(data) !== 'undefined' && data.length > 0 ) {
						infos.data._id = data[0]._id;
						
						infos.data.value = '';
						for ( var n=0; n<param.dynamic.fields.length; n++ ) {
							if ( n > 0 ) infos.data.value += param.dynamic.separator;
							infos.data.value += data[0][param.dynamic.fields[n]];
						}
					}
					else {
						infos.data.value = '';
					}
					
					infos.field = param.field;
					
					datas.push(infos);
					incr++;
					if ( incr == params.length ) {
						db.close();
						callback(false, datas);
					}
				});
			}
		});
	}
	
	/*****
	***	Champs dynamique
	*****/
	this.getDatas = function (params, callback) {
		var self = this;
		
		db.connect(function () {
			var datas = {};
			
			var incr = 0;
			
			for ( var n=0; n<params.length; n++ ) {
				query(params[n]);
			}
			
			function query(param) {
				var model = db.model(param.table);
				
				var reg = new RegExp('.*'+param.motif+'.*', 'ig');
				if ( param.motif ) {
					var where = [];
					for ( var f=0; f<param.queryFields.length; f++ ) {
						var w = {};
						w[param.queryFields[f]] = reg;
						where.push(w);
					}
					where = {$or : where};
					if ( param.where ) {
						for ( var f in param.where ) {
							var reg = new RegExp(param.where[f]);
							where[f] = reg;
						}
					}
				}
				
				var query = model.find(where);
				var sort = {};
				sort[param.sort] = param.asc;
				query.sort(sort);
				
				query.exec(function (err, data) {
					if (err) console.log(err);
					datas[param.field] = data;
					incr++;
					if ( incr == params.length ) {
						db.close();
						callback(false, datas);
					}
				});
			}
		});
	}
	
	
	/*****
	***	List
	*****/
	
	this.list = function (param, callback) {
		var self = this;
		var module = this.module;
		
		db.connect(function () {
			var model = db.model(param.table);
			
			// Projection
			var proj = {};
			for ( var i=0; i<param.fields.length; i++ ) {
				proj[param.fields[i]] = true;
			}
			
			// Construction de la clause WHERE
			var conditions = [];
			if ( param.keywords ) {
				var where = [];
				for ( var i=0; i<param.fields.length; i++ ) {
					var field = param.fields[i];
					if ( model.schema.paths[field] ) {
						var type = model.schema.paths[field].instance;
						var reg = new RegExp('.*'+param.keywords+'.*', 'ig');
						
						if ( type == 'String' ) {
							var w = {}
							w[field] = reg;
							where.push(w);
						}
					}
				}
				where = {$or : where};
				conditions.push(where);
			}
			if ( param.view && param.view != 'main' ) {
				var view = module.views.all[param.view];
				if ( view ) {
					conditions.push(view.condition);
				}
			}
			if ( param.auth ) {
				for ( var c=0; c<param.auth.length; c++ ) {
					conditions.push(param.auth[c]);
				}
			}
			
			var where = null
			if ( conditions.length > 0 ) {
				where = { $and : conditions };
			}
			
			// Query
			var query = model.find(where, {_id:true});
			var queryPage = model.find(where, proj);
			
			// Tri
			if ( param.sort ) {
				sort = {};
				sort[param.sort.field] = param.sort.asc;
				queryPage.sort(sort);
			}
			// Limites
			var elempp = self.module.elempp;
			var limit = elempp;
			var from = 0;
			if ( param.page ) {
				var from, limit;
				
				if ( param.page === 'all' ) {
					from = 0;
					limit = 1000;
				}
				else {
					from = elempp * (param.page - 1);
					limit = elempp;
				}
			}
			queryPage.skip(from).limit(limit);
			
			query.count(function (err, count) {
				queryPage.exec(function (err, data) {
					if (err) console.log(err);
					db.close();
					var out = {};
					
					out.data = self.restrForExtract(data, module);
					out.count = count;
					callback(out);
				});
			});
			
		});
	}
	
	
	/*****
	***	Add
	*****/
	this.add = function (param, callback) {
		param.data = this.restrForUpdate(param.data, this.module);
		
		db.connect(function () {
			var model = db.model(param.table);
			var elem = new model(param.data);
			console.log('Adding');
			
			elem.save(function (err, data) {
				db.close();
				callback(err, data);
			});
		});
	}
	
	
	/*****
	***	Mod
	*****/
	this.mod = function (param, callback) {
		param.data = this.restrForUpdate(param.data, this.module);
		
		db.connect(function () {
			var model = db.model(param.table);
			var args = {_id 	: param.id };
			
			model.update(args, param.data, {multi : false}, function (err) {
				if (err) console.log(err);
				console.log('Updated');
				db.close();
				callback();
			});
		});
	}
	
	
	/*****
	***	Del
	*****/
	this.del = function (param, callback) {
		db.connect(function () {
			var model = db.model(param.table);
			
			for ( var i=0; i<param.ids.length; i++ ) {
				console.log('Removing : '+param.ids[i]);
				var args = {_id 	: param.ids[i] };
				
				model.remove(args, function (err) {
					if (err) console.log(err);
					console.log('Removed');
					db.close();
					callback();
				});
			}
		});
	}
	
	
	
	/*****
	***	Fonctions
	*****/
	
	this.restrForExtract = function (data, module) {
		for ( f in module.fields.all ) {
			var field = module.fields.all[f];
			if ( field.parent ) {
				if ( util.isArray(data) ) {
					for ( var i=0; i<data.length; i++ ) {
						data[i][f] = data[i][field.parent][f];
					}
				}
				else {
					data[f] = data[field.parent][f];
				}
			}
		}
		return data;
	}
	this.restrForUpdate = function (data, module) {
		for ( f in module.fields.all ) {
			var field = module.fields.all[f];
			if ( field.parent ) {
				if ( _.isUndefined(data[field.parent]) ) data[field.parent] = {};
				
				data[field.parent][f] = data[f];
				data = _.omit(data, f);
			}
		}
		return data;
	}
	
	return this;
}