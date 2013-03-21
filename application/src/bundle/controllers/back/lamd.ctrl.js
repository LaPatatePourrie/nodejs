this.statut = 5;


/****
*** Variables globales
****/

var jade = new jade();

var pathView = pwd+'/application/src/bundle/views/back/';
var views = {
	list   		: pathView+'list.jade',
	element   	: pathView+'element.jade',
	form		: pathView+'form.jade',
	options		: pathView+'options.jade',
	menu		: pathView+'menu.jade'
}

var working = {};

var thisModule = false;
var dflt = {
	separator 		: ' - '
}

var files = {};

var users = lib.users.Users();



/****
*** Packages, catégories, modules
****/
var packs = require('./modules.js').modules;



exports.load = function (param, callback) {
	callback(param);
};




/****
*** Sockets
****/

exports.sockets = function (param) {
	var io = param.io;
	var model = param.model;
	
	param.socketAuthorization();
	
	io.of('/module').on('connection', function (socket) {
		var thisUser = param.getThisUser(socket, lib.users);
		
		if ( !users.get(thisUser.login) ) {
			users.add(thisUser);
		}
		else {
			thisUser = users.get(thisUser.login);
		}
		
		
		/*****
		***	Packages
		*****/
		
		socket.on('packages', function (callback) {
			console.log('Packages');
			// Définition des droits sur les modules
			for ( p in packs.all ) {
				packs.all[p].modules = {};
				
				for ( c in packs.all[p].categories.all ) {
					var category = packs.all[p].categories.all[c];
					
					for ( var k=0; k<category.order.length; k++ ) {
						var m = category.order[k];
						var path = pwd+'/application/src/bundle/controllers/back/modules/'+p+'/'+m+'.ctrl.js';
						
						if ( !fs.existsSync(path) )  console.log('Le module n\'existe pas !')
						// Le module existe
						else {
							var module = require(path).load();
							packs.all[p].modules[m] = module;
							// Droits sur le module
							packs.all[p].modules[m].auth = isAllowed(module, thisUser);
						}
					}
				}
			}
			
			if ( thisUser.lamd && thisUser.lamd.selectedPackage ) packs.selected = thisUser.lamd.selectedPackage
			
			vars = {packs : packs, user : thisUser};
			tpl = jade.render(views.menu, vars);
			callback(false, tpl);
		});
		
		// Changement de package
		socket.on('setPackage', function (pack, callback) {
			if (!packs.all[pack]) return;
			if (!thisUser.lamd) thisUser.lamd = {};
			
			thisUser.lamd.selectedPackage = pack;
			console.log('Set package : '+pack);
			callback();
		});
		
		
		
		
		/*****
		***	Module
		*****/
		
		// Nouveau module
		socket.on('getModule', function (module, callback) {
			if ( working.getModule ) return;
			if ( thisModule && thisModule.name == param.module ) {
				// Le module est déjà chargé
				// On recharge les droits
				thisModule.auth = isAllowed(thisModule, thisUser);
				model.module = thisModule;
				callback(false, thisModule);
				return
			}
			
			// Le module n'existe pas
			if ( !packs.all[packs.selected].modules[module] ) {
				callback({txt : 'Le module n\'existe pas.'});
				return;
			}
			
			// Working on GetModule
			working.getModule = true;
			
			// Le module existe
			// Chargement du nouveau module
			console.log('GetModule');
			thisModule = packs.all[packs.selected].modules[module];
			
			if ( !thisModule.auth.main ) {
				// Non autorisé
				thisModule = false;
				callback({value : 'nonAuthorized', txt : 'Non autoris&eacute;'}); 
				return
			}
			
			console.log('setModule');
			model.module = thisModule;
			
			
			
			/*****
			***	Modelisation des données (champs dynamiques, paramètre oubliés, inutilisés...)
			*****/
			thisModule.uploads = false;
			thisModule.fields.all = removeFields();
			thisModule.fields.all = manageFields();
			thisModule = manageModule();
			handleDynamics(); // Asynchrone : appelle le callback final
			
			
			// Paramètres du module
			function manageModule() {
				var newModule = thisModule;
				
				// Par défaut, la vue est la vue principale "main"
				newModule.view = 'main';
				// Par défaut, l'ordre des champs est celui de "main"
				newModule.order = thisModule.fields.order;
				
				if ( !newModule.elempp ) 		newModule.elempp = 50
				if ( !newModule.sort ) 			newModule.sort = {field : thisModule.fields.order[0], asc : 1}
				if ( !newModule.actions ) 		newModule.actions = {add : true, mod : true, del : true}
				
				// Champs rajoutés
				newModule.search = {};
				newModule.search.keywords = '';
				
				return newModule;
			}
			
			// Suppression des champs qui ne sont pas dans fields.order
			function removeFields() {
				var newFields = {};
				for ( field in thisModule.fields.all ) {
					if ( _.contains(thisModule.fields.order, field) ) 
						newFields[field] = thisModule.fields.all[field];
				}
				return newFields;
			}
			
			// Ajout des champs omis volontairement
			function manageFields() {
				var fields = thisModule.fields.all;
				
				for ( f in thisModule.fields.all ) {
					var field = thisModule.fields.all[f];
					
					// Label (list, form)
					if ( field.label && !field.label.list) 	field.label = {list : field.label};
					if ( !field.label) 						field.label = {list : f.ucfirst()};
					if ( !field.label) 						field.label = {list : f.ucfirst()};
					if ( !field.label.form) 				field.label.form = field.label.list;
					
					// Display (list, form)
					if ( field.display === false ) 						field.display = {list:false, form:false};
					if ( !field.display && field.display!== false ) 	field.display = {list:true, form:true};
					if ( field.display === true ) 						field.display = {list:true, form:true};
					if ( (!field.display.list && field.display.list!== false) && (!field.display.form && field.display.form!== false) ) 	{ field.display.list = true, field.display.form = true };
					
					if ( !field.display) 					field.display = {list : true, form : true};
					if ( !field.display.maxLength)			field.display.maxLength = 150;
					
					// Trigers
					if ( field.triggers) {
						for ( var i=0; i<field.triggers.length; i++ ) {
							if ( !_.isArray(field.triggers[i].values) ) 		field.triggers[i].values = [field.triggers[i].values];
							if ( !_.isArray(field.triggers[i].fields) ) 		field.triggers[i].fields = [field.triggers[i].fields];
						}
					}
					
					// Dynamic fields
					if ( field.param.value && !field.param.value.fixed && field.param.value.dynamic ) {
						if ( !_.isArray(field.param.value.dynamic.fields) ) 		field.param.value.dynamic.fields = [field.param.value.dynamic.fields]
						if ( !field.param.value.dynamic.separator ) 				field.param.value.dynamic.separator = ' - '
						if ( !field.param.value.dynamic.where ) 					field.param.value.dynamic.where = null
						if ( !field.param.value.dynamic.sort ) 						field.param.value.dynamic.sort = field.param.value.dynamic.fields[0]
						if ( !field.param.value.dynamic.queryFields ) 				field.param.value.dynamic.queryFields = field.param.value.dynamic.fields;
						if ( !_.isArray(field.param.value.dynamic.queryFields) ) 	field.param.value.dynamic.queryFields = [field.param.value.dynamic.queryFields];
						if ( !field.param.value.dynamic.asc ) 						field.param.value.dynamic.asc = 1
					}
					
					// Default values
					if (field.param.dflt && !_.isArray(field.param.dflt)) field.param.dflt = [field.param.dflt];
					
					// Files
					if ( field.param.type == 'file' ) {
						thisModule.uploads = {param : field.param, field : f}
						
						if ( !field.param.file.maxSize ) 		field.param.file.maxSize = 1000000
						if ( !field.param.file.statut ) 		field.param.file.statut = 'priv'
						if ( !field.param.file.max ) 			field.param.file.max = 10
						if ( field.param.file.ext && !_.isArray(field.param.file.ext) )	field.param.file.ext = [field.param.file.ext];
					}
					
					fields[f] = field;
				}
				
				if ( thisModule.views ) {
					for ( v in thisModule.views.all ) {
						var view = thisModule.views.all[v];
						
						if ( !view.order ) view.order = thisModule.fields.order
					}
				}
				
				return fields;
			}
			
			// Gestion des champs dynamiques (BDD) --- à insertion dans le code (checkbox, radio, autocomplete réduit)
			function handleDynamics() {
				var dynamics = [];
				
				for ( f in thisModule.fields.all ) {
					var field = thisModule.fields.all[f];
					if ( 
						(field.param.value &&  !field.param.value.fixed && !field.param.autocomplete ) 
						||
						(field.param.autocomplete && field.param.value.dynamic && field.param.value.embedded )
						) {
						// Autocomplete, checkbox, radio, select...
						var infos = {};
						infos = field.param.value.dynamic;
						infos.field = f;
						dynamics.push(infos);
					}
				}
				
				
				// Pas de champs dynamiques à traiter
				if ( dynamics.length == 0 ) {
					working.getModule = false;
					callback(false, thisModule);
				}
				else {
					// On traite les champs dynamiques
					model.getDatas(dynamics, function (err, datas){
						for ( f in datas ) {
							var field = thisModule.fields.all[f];
							var infos = field.param.value.dynamic;
							thisModule.fields.all[f].param.value.values = {};
							
							for ( var i=0; i<datas[f].length; i++ ) {
								var value = '';
								
								for ( var j=0; j<infos.fields.length; j++ ) {
									if ( j > 0 )  value += ' '+infos.separator+' ';
									value += datas[f][i][infos.fields[j]];
								}
								thisModule.fields.all[f].param.value.values[datas[f][i]._id] = value;
							}
						}
						
						// Final callback
						model.module = thisModule;
						working.getModule = false;
						callback(false, thisModule);
					});
				}
			}
		});
		
		
		
		
		/*****
		***	List
		*****/
		socket.on('list', function (param, callback) {
			if ( working.list ) 	 return;
			if ( !thisModule )		 return;
			if ( !thisModule.auth[thisModule.view].actions.list ) {
				callback({txt : 'Non authorized'});
				return;
			}
			// Working on list
			working.list = true;
			
			console.log('Listing');
			
			// Pagination
			var page = param.page
			if ( !page ) {
				page = 1;
			}
			
			// Classement des résultats
			if ( param.sort ) {
				thisModule.sort = param.sort;
			}
			var sort = thisModule.sort;
			// Mots-clés de rechercher
			thisModule.search.keywords = '';
			var keywords = false;
			if ( param.keywords ) {
				keywords = param.keywords;
				thisModule.search.keywords = keywords;
			}
			// Vues
			if ( isView(param.view) ) {
				thisModule.order = thisModule.views.all[param.view].order;
				thisModule.view = param.view;
			}
			else {
				thisModule.view = 'main';
				thisModule.order = thisModule.fields.order;
			}
			// Fields
			var fields = thisModule.order;
			
			model.list({
					table 		: thisModule.table, 
					fields 		: fields,
					sort 		: sort, 
					keywords 	: keywords, 
					page 		: page, 
					view 		: thisModule.view, 
					auth 		: thisModule.auth.datas
				},
				function(param) {
					var module = thisModule;
					module.count = param.count;
					module.page = page;
					module.data = manageOutputData('list', param.data);
					module.user = thisUser;
					module.single = false;
					
					manageOutputDataAsync(module, function (module) {
						out = jade.render(views.list, {module:module});
						working.list = false;
						console.log('End of List');
						callback(false, out);
					});
					
				}
			);
		});
		
		
		/*****
		***	Form
		*****/
		socket.on('form', function (param, callback) {
			if ( !thisModule ) return;
			
			console.log('Form');
			var tpl = {
				module  : thisModule
			}
			
			// Form mod
			if ( param.id ) {
				if ( working.formMod ) return;
				if ( !thisModule.auth[thisModule.view].actions.mod ) {
					callback({txt : 'Non authorized'});
					return;
				}
				// Working on form mod
				working.formMod = true;
				
				thisModule.form = {id : param.id};
				
				tpl.mode = 'mod';
				console.log('getElem');

				model.getElem({id : param.id, table : thisModule.table}, function (data) {
					var module = tpl.module;
					module.data = manageOutputData('mod', data);
					module.data = [module.data];
					
					manageOutputDataAsync(module, function (module) {
						module.data = module.data[0];
						tpl.module = module;
						working.formMod = false;
						
						var out = jade.render(views.form, tpl);
						callback(false, out, data);
					});
				});
			}
			
			// Form add
			else {
				if ( working.formAdd ) return;
				if ( !thisModule.auth[thisModule.view].actions.add ) {
					callback({txt : 'Non authorized'});
					return;
				}
				// Working on form add
				working.formAdd = true;
				
				tpl.mode = 'add';
				for ( field in thisModule.fields.all ) {
					tpl.module.data[field] = '';
				}
				working.formAdd = false;
				out = jade.render(views.form, tpl);
				callback(false, out);
			}
		});
		
		
		/*****
		***	Add
		*****/
		socket.on('add', function (param, callback) {
			if ( working.add )  	return;
			if ( !thisModule ) 		return
			if ( !thisModule.auth[thisModule.view].actions.add ) {
				callback({txt : 'Non authorized'});
				return;
			}
			// Working on add
			working.add = true;
			
			var data = manageInputData(param.data);
			
			console.log('Add');
			model.add({
					table 	: thisModule.table, 
					data	: data
				},
				function(err, data) {
					if (err) console.log(err);
					else {
						console.log('Added');
						
						// Transfert des fichiers
						if ( thisModule.uploads ) {
							moveUploadedFiles(data);
						}
						var mod = thisModule;
						mod.data = manageOutputData('list', [data]);
						mod.user = thisUser;
						mod.single = true;
						
						manageOutputDataAsync(mod, function (mod) {
							working.add = false;
							var tpl = jade.render(views.element, {module : mod});
							callback(data.id, tpl);
						});
					}
				}
			);
		});
		
		
		/*****
		***	Mod
		*****/
		socket.on('mod', function (param, callback) {
			if ( working.mod)  return;
			if ( !thisModule ) return;
			if ( !thisModule.auth[thisModule.view].actions.mod ) {
				callback({txt : 'Non authorized'});
				return;
			}
			// Working on mod
			working.mod = true;
			
			var data = manageInputData(param.data);
			
			model.mod({
					table 	: thisModule.table, 
					id		: param.id,
					data	: data
				},
				function(err) {
					if ( err ) console.log(err);
					else {
						console.log('Id Modified : '+param.id)
						working.mod = false;
						
						// Transfert des fichiers
						if ( param.toggle ) {
							
							callback();
						}
						else {
							if ( thisModule.uploads ) {
								moveUploadedFiles(data, param.id);
							}
							var mod = thisModule;
							mod.data = manageOutputData('list', [data]);
							mod.user = thisUser;
							mod.single = true;
							
							manageOutputDataAsync(mod, function (mod) {
								var tpl = jade.render(views.element, {module : mod});
								callback(param.id, tpl);
							});
						}
					}
				}
			);
		});
		
		
		/*****
		***	Del
		*****/
		socket.on('del', function (param, callback) {
			if ( working.del )  return;
			if ( !thisModule ) return;
			if ( !thisModule.auth[thisModule.view].actions.del ) {
				callback({txt : 'Non authorized'});
				return;
			}
			// Working on del
			working.del = true;
			
			console.log('Del');
			model.del({
					table 	: thisModule.table, 
					ids		: param.ids
				},
				function(err) {
					if ( thisModule.uploads ) {
						removeUploadedFiles(param.ids);
					}
					callback();
					working.del = false;
					console.log('Id supprimed : '+param.ids)
				}
			);
		});
		
		
		/*****
		***	Autocomplete
		*****/
		var onDemand = false;
		
		socket.on('autocomplete', function (param, callback) {
			if ( working.autocomplete)  return;
			if ( !thisModule ) return
			if ( onDemand ) return;
			// Working on autocomplete
			working.del = true;
			
			onDemand = true;
			datas = param.dynamic;
			datas.field = param.field;
			datas.motif = param.motif;
			datas = [datas];
			
			model.getDatas(datas, function(err, data) {
				data = data[param.field];
				var out = [];
				
				for ( var i=0; i<data.length; i++ ) {
					out[i] = {};
					out[i].value = data[i]._id;
					out[i].txt = '';
					for ( var k=0; k<param.dynamic.fields.length; k++ ) {
						if ( k > 0 ) out[i].txt += param.dynamic.separator;
						out[i].txt += data[i][param.dynamic.fields[k]];
					}
				}
				onDemand = false;
				working.autocomplete = false;
				callback(err, out);
				console.log('Autocomplete recupered')
			});
		});
		
		
		
		
		
		/*****
		***	Uploads
		*****/
		
		socket.on('upload-start', function (data) {
			console.log('Starting');
			
			var name = data.name;
			
			files[name] = {
				size 		: data['size'],
				data 		: '',
				downloaded  : 0,
				path		: filePath('tmp').file(name),
				ended 		: false
				
			}
			var place = 0;
			console.log(files[name]);
			
			// Si le fichier existe on le supprime
			fs.unlink(files[name].path);
			startUpload();
			
			// L'upload commence
			console.log('New upload');
			function startUpload () {
				fs.lstat(filePath('tmp').dir().module, function(err, stats) {
					if ( err || !stats.isDirectory() ) {
						// Création du répertoire temporaire du module
						fs.mkdirSync(filePath('tmp').dir().module);
					}
					fs.open(files[name].path, 'a', 0777, function(err, fd)	{
						if(err) console.log(err);
						else {
							console.log('Tmp file created '+files[name].path);
							files[name].handler = fd; //We store the file handler so we can write to it later
							socket.emit('upload-more', {
								name	 : name,
								place	 : place, 
								percent  : 0 
							});
						}
					});
				});
			}
		});
		
		socket.on('upload', function (data) {
			var name = data['name'];
			if ( !files[name] ) return;
			
			files[name].downloaded += data.data.length;
			files[name].data += data['data'];
			
			if ( files[name].downloaded == files[name].size || files[name].downloaded >= files[name].size ) {
				// Upload terminé
				fs.write(files[name].handler, files[name].data, null, 'Binary', function(err, written) {
					console.log('Upload ended');
					files[name].ended = true;
					
					fs.close(files[name].handler, function (err) {
						if (err) console.log(err);
					
						socket.emit('upload-ended', {
							name	: name
						});
					});
				});
			}
			else if ( files[name].data.length > 10485760 ) {
				fs.write(files[name].handler, files[name].data, null, 'Binary', function(err) {
					files[name]['data'] = '';
					var place = files[name].downloaded / 524288;
					var percent = (files[name].downloaded / files[name].size) * 100;
					
					socket.emit('upload-more', {
						name	: name,
						place  	: place,
						percent :  percent
					});
				});
			}
			else {
				var place = files[name].downloaded / 524288;
				var percent = (files[name].downloaded / files[name].size) * 100;
			
				socket.emit('upload-more', { 
					name	 : name,
					place	 : place,
					percent	 :  percent
				});
			}
		});
		
		socket.on('upload-del', function (data, callback) {
			console.log('Delete');
			var name = data.name;
			
			if ( files[name] ) {
				var path = files[name].path;
				if ( data.statut == 'previously' ) {
					path = filePath('uploads').file(name);
				}
				console.log('Deleting : '+path);
				fs.unlink(path);
				files = _.omit(files, name);
				callback();
			}
			else {
				callback();
			}
		});
		
		socket.on('upload-deleteFiles', function (uploads) {
			for ( u in uploads ) {
				var upload = uploads[u];
				if ( upload.statut != 'previously' ) {
					var path = filePath('tmp').file(u);
					console.log('Deleting unvalidate : '+path);
					fs.unlink(path);
				}
			}
		});
		
		socket.on('upload-previously', function (file, callback) {
			files[file.name] = file;
			files[file.name].path = filePath('tmp').file(file.name);
			callback();
		});
		
		socket.on('upload-checkFile', function (files, callback) {
			var existing = [];
			for ( var i=0; i<files.length; i++ ) {
				var path = filePath('uploads').file(files[i].name);
				if ( fs.existsSync(path) ) existing.push(files[i]);
			}
			callback(existing);
		});
		
		
		
		function moveUploadedFiles (data, id) {
			console.log('moveUploadedFiles');
			
			var uploads = data[thisModule.uploads.field];
			
			if ( !uploads) return;
			if ( !id ) var id = data._id;
			
			
			fs.lstat(filePath('uploads').dir().module, function(err, stats) {
				if ( err || !stats.isDirectory() ) {
					// Création du répertoire du module
					fs.mkdirSync(filePath('uploads').dir().module);
				}
				
				fs.lstat(filePath('uploads').dir(id).id, function(err, stats) {
					if ( err || !stats.isDirectory() ) {
						// Création du répertoire de l'élément ID
						fs.mkdirSync(filePath('uploads').dir(id).id);
					}
					for ( var i=0; i<uploads.length; i++ ) {
						var name = uploads[i].name;
						var path = {
							from 	: filePath('tmp').file(name), 
							to 		: filePath('uploads').file(name, id)
						}
						
						if (!fs.existsSync(path.from)) {
							console.log('Le fichier source n\'existe pas : '+path.from);
						}
						else if (fs.existsSync(path.to)) {
							fs.unlink(path.to);
							move(path);
							console.log('Le fichier cible existe deja');
						}
						else if (!files[name].ended) {
							fs.unlinkSync(path.from);
							fs.close(files[name].handler, function (err) {
								if (err) console.log(err);
							});
							console.log('Le téléchargement n\'est pas termine');
						}
						else {
							move(path);
						}
					}
				});
			});
			
			function move (path) {
				fs.move(path.from, path.to, function (err) {
					if (err) console.log(err);
					console.log('File moved to '+path.to);
				});
			}
		}
		function removeUploadedFiles (ids) {
			for ( var i=0; i<ids.length; i++ ) {
				var dir = filePath('uploads').dir(ids[i]).id;
				
				fs.lstat(dir, function(err, stats) {
					if ( !err && stats.isDirectory() ) {
						// Le répertoire existe
						fs.rmdirfSync(dir);
						console.log('Directory '+dir+' removed');
					}
				});
			}
		}
		
		function filePath(type) {
			var statut = thisModule.uploads.param.file.statut;
			var module = thisModule.name;
			var directories = {
				tmp			: {
					priv		: pwd+'/data/tmp/',
					pub		: pwd+'/public/data/tmp/'
				},
				uploads	: {
					priv		: pwd+'/data/uploads/',
					pub			: pwd+'/public/data/uploads/'
				}
			}

			this.dir = function (id) {
				var path = directories[type][statut]+module;
				return {
					module	: path,
					id		: path+'/'+id
				}
			}
			this.file = function (name, id) {
				if ( !id && thisModule.form ) id = thisModule.form.id;
				
				if ( type == 'uploads' ) {
					var path = this.dir(id).id+'/'+name;
				}
				else if ( type == 'tmp' ) {
					var path = this.dir().module+'/'+name;
				}
				return path; 
			}
			
			return this;
		}
		
		
		
		/*****
		***	Options
		*****/
		
		socket.on('options', function (callback) {
			var tpl = jade.render(views.options, {module : thisModule});
			callback(false, tpl);
		});
	});
	
	
	
	
	
	
	
	
	
	/*****
	***	Fonctions
	*****/
	
	function noNullData (data) {
		var newData = [];
		for ( var i in data ) {
			newData[i] = {};
			for ( var field in data[i] ) {
				if ( data[i][field] === null ) {
					newData[i][field] = '';
				}
				else {
					newData[i][field] = data[i][field]
				}
			}
		}
		return newData;
	}
	
	function manageOutputData(mode, data) {
		if ( mode == 'mod' ) data = [data];
		data = noNullData(data);
		
		var fields = thisModule.fields.all;
		var newDatas = [];
		
		for ( var i=0; i<data.length; i++ ) {
			newData = {};
			
			for ( f in data[i] ) {
				if ( !_.contains(thisModule.fields.order, f) ) continue;
				newData[f] = data[i][f];
				
				// Widgets
				if ( fields[f].param.widget ) {
					
					// Date
					if ( fields[f].param.widget.date ) {
						var date = data[i][f];
						if ( date )  newData[f] = lib.time.toString(date);
					}
				}
				
				newData._id = data[i]._id;
			}
			newDatas.push(newData);
		}
		
		if ( mode == 'mod' ) newDatas = newDatas[0];
		
		return newDatas;
	}
	
	function manageOutputDataAsync (module, callback) {
		var data = module.data;
		var fields = thisModule.fields.all;
		var newDatas = [];
		var elems = [];
		
		for ( var i=0; i<data.length; i++ ) {
			newData = {};
			
			for ( f in data[i] ) {
				if ( !_.contains(thisModule.order, f) ) continue;
				
				if ( fields[f].param.autocomplete && !fields[f].param.value.embedded ) {
					// Autocomplete non-embedded
					var dynamic = fields[f].param.value.dynamic;
					var elem = {};
					elem.dynamic = dynamic;
					elem.id = data[i][f];
					elem.field = f;
					elems.push(elem);
				}
			}
		}
		
		model.getElems(elems, function (err, newElems) {
			for ( var i=0; i<newElems.length; i++ ) {
				var field = newElems[i].field;
				
				if ( typeof(newElems[i].data) == 'undefined' ) continue;
				
				for ( var k=0; k<module.data.length; k++ ) {
					if ( newElems[i].data._id == module.data[k][field] ) {
						module.data[k][field] = newElems[i].data.value;
					}
				}
			}
			callback(module);
		});
	}
	
	function manageInputData(data) {
		console.log('Manage input');
		var fields = thisModule.fields.all;
		
		data = noNullData([data]);
		data = data[0];
		
		newData = {};
		
		for ( f in data ) {
			newData[f] = data[f];
			field = fields[f];
			
			if ( !field ) continue;
			
			// Defaults values
			if ( field.param.dflt && ( !newData[f] || (typeof(newData[f]) == 'String' && newData[f].isEmpty()) ) ) {
				if ( field.param.widget && field.param.widget.date && field.param.dflt == 'now' ) {
					// Current date
					newData[f] = new Date();
				}
				else {
					// Valeur par défaut
					newData[f] = field.param.dflt;
				}
			}
			
			// Widgets
			if ( field.param.widget ) {
				
				if ( field.param.widget.date ) {
					// Date
					if ( !lib.time.isDate(newData[f]) ) {
						newData[f] = lib.time.toDate(newData[f]);
					}
				}
			}
		}
		
		console.log(newData);
		console.log('End manage input');
		return newData;
	}
}


function isAllowed (module, user) {
	var auth = {};
	auth.main = {};
	auth.main.actions = buildActionsAuth(module);
	
	if ( module.views ) {
		for ( var i=0; i<module.views.order.length; i++ ) {
			var v = module.views.order[i];
			var view = module.views.all[v];
			auth[v] = { actions : buildActionsAuth(view) };
		}
	}
	auth.fields = buildFieldAuth(module);
	auth.datas = buildDatasAuth(module);
	return auth;
	
	function buildFieldAuth (module) {
		// Restriction sur les champs
		var auth = {};
		for ( var i=0; i<module.fields.order.length; i++ ) {
			var f = module.fields.order[i];
			var field = module.fields.all[f];
			
			if ( !field.restrict )	auth[f] = true;
			else {
				if ( field.restrict >= user.statut ) 		auth[f] = true;
				else 										auth[f] = false;
			}
		}
		return auth;
	}
	function buildDatasAuth (view) {
		var auth = [];
		// Restriction sur les données
		if ( view.restrict && view.restrict.datas ) {
			rd = view.restrict.datas;
			
			for ( var i=0; i<rd.length; i++ ) {
				if ( rd[i].restricted < user.statut ) {
					auth.push(rd[i].condition);
				}
			}
		}
		return auth;
	}
	function buildActionsAuth(view) {
		var auth = {
			list : false,
			add  : false,
			mod  : false,
			del  : false
		}
		
		if ( !view.restrict || !view.restrict.actions )	{
			// Restrict n'est pas renseigné
			auth.list = true;
			auth.add = true;
			auth.mod = true;
			auth.del = true;
			
			return auth;
		}
		
		// Restriction d'actions
		var ra = view.restrict.actions;
		
		if ( ra.list >= user.statut || !ra.list ) {
			// On peut lister
			auth.list = true;
			
			if ( ra.add >= user.statut || !ra.add )	auth.add = true;
			if ( ra.mod >= user.statut || !ra.mod )	auth.mod = true;
			if ( ra.del >= user.statut || !ra.del )	auth.del = true;
		}
		else {
			auth = false;
		}
		
		return auth;
	}
}

function isView(view) {
	if ( !thisModule.views ) 	return false;
	return (_.contains(thisModule.views.order, view));
}


function jade () {
	this.render = function (view, obj) {
		var str = fs.readFileSync(view, 'utf8');
		var engine = require('jade').compile(str, { filename: view, pretty: true });
		var tpl = engine(obj);
		
		return tpl;
	}
}