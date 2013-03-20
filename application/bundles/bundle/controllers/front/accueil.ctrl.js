this.statut = 5;

exports.load = function (param, callback) {
	param.js.push('upload');
	
	callback(param);
	
	function loadDatas () {
		// Charge la bdd
		var logins = [
			'Alexis',
			'Jean', 
			'Pierre',
			'Alain Pierre',
			'Jacques',
			'Henri',
			'Pierre',
			'Raoul',
			'Sylvain',
			'Pascal',
			'Raoul',
			'Pierre-Jean',
			'Alexandre',
			'Alexis',
			'Marcel',
			'Denis',
			'Claude',
			'Jeff',
			'Francois',
			'Laurent',
			'Philipppe',
			'Hector',
			'Albert',
			'Micheline',
			'Lila',
			'Paul',
			'Paulette',
			'Herbert',
			'Bernadette',
			'Suzie',
			'Léa',
			'Leandre',
			'Leo',
			'Renaud',
			'Paulou',
			'Gilles',
			'Gilbert',
			'Koko',
			'Cypres',
			'Hill',
			'Louis',
			'Lucie',
			'Lucienne',
			'Hippolyte',
			'Julien',
			'Jérôme',
			'Romain',
			'Jules',
			'Louise',
			'Denise',
			'Sylvie',
			'Jocelyne',
			'Fernand',
			'André'
		];
		var dateInsc = new Date();
		var email = 'alexis@annuaire.com';
		var url = 'http://www.annuaire.com';
		var dev = '0';
		
		var load = [];
		
		for ( var i=0; i<1000; i++ ) {
			var n = Math.floor((Math.random()*(logins.length-1)));
			
			var statut = Math.floor((Math.random()*4+1));
			
			load.push({
				login		: logins[n],
				statut		: statut,
				dateInsc	: dateInsc,
				url			: url,
				dev			: dev,
				email		: email
			});
		}
		
		param.main.model.loadUsers(load, function() {
			console.log('Data loaded');
			
			callback(param);
		});
	}
	
};


exports.sockets = function (param) {
	var io = param.io;
	var model = param.model;
	
	param.socketAuthorization();
	
	
	var files = {};
	var dir = {
		tmp		: pwd+'/data/tmp/',
		uploads	: pwd+'/data/uploads/'
	}
	
	
	io.of('/accueil').on('connection', function (socket) {
			
		socket.on('upload-start', function (data) { //data contains the variables that we passed through in the html file
			console.log('Starting');
			console.log(data);
			
			var name = data.name;
			
			files[name] = {
				size 		: data['size'],
				data 		: '',
				downloaded  : 0,
				path		: dir.tmp+name
				
			}
			var place = 0;
			
			try {
				var Stat = fs.statSync();
				if ( Stat.isFile() ) {
					files[name]['downloaded'] = Stat.size;
					place = Stat.size / 524288;
				}
			}
			catch (er) {} 
			
			console.log('New file');
			console.log(files[name]);
			
			fs.open(files[name].path, 'w+', 0777, function(err, fd)	{
				if(err) console.log(err);
				else {
					files[name].handler = fd; //We store the file handler so we can write to it later
					socket.emit('upload-more', {
						name	 : name,
						place	 : place, 
						percent  : 0 
					});
				}
			});
		});
		
		socket.on('upload', function (data) {
			var name = data['name'];
			files[name].downloaded += data.data.length;
			files[name].data += data['data'];
			
			if ( files[name].downloaded == files[name].size ) { //If File is Fully Uploaded
				fs.write(files[name].handler, files[name].data, null, 'Binary', function(err){
					/*fs.move(files[name].path, dir.uploads+name, function(err) {
						console.log('Deleted '+pwd+'/Temp/' + name);
						socket.emit('upload-ended', {
							name	: name
						});
					});*/
					socket.emit('upload-ended', {
						name	: name
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
			var name = data.name;
			console.log('Delete '+data.name);
			console.log('Path : '+files[name].path);
			fs.unlink(files[name].path);
			files = _.omit(files, name);
			callback();
		});
		
		
		/*
		var inp = fs.createReadStream("Temp/" + name);
		var out = fs.createWriteStream("Video/" + name);
		util.pump(inp, out, function(){
		   fs.unlink("Temp/" + name, function () { //This Deletes The Temporary File
			  //Moving File Completed
		   });
		});
		exec("ffmpeg -i Video/" + name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Video/" + name  + ".jpg", function(err){
		   socket.emit('Done', {'Image' : 'Video/' + name + '.jpg'});
		});*/
	});
}