this.statut = 5;

exports.load = function (param, callback) {
	var query = url.parse(param.req.url, true).query;
	
	var error = {
		unfound			: function () {
			param.main.tpl.out = 'introuvable';
			callback(param);
		},
		unauthorized	: function () {
			param.main.tpl.out = 'unauthorized';
			callback(param);
		},
		wrongUrl		: function () {
			param.main.tpl.out = 'wrongUrl';
			callback(param);
		}
	}
	
	
	if ( !query.file ) error.wrongUrl();
	
	var file = {
		name	: query.file
	}
	
	if ( query.type == 'tmp' ) {
		if ( query.statut == 'pub' )				file.path = pwd+'/public/data/tmp/'+query.module+'/'+query.id+'/'+query.file;
		else if ( query.statut == 'priv' )		file.path = pwd+'/data/tmp/'+query.module+'/'+query.id+'/'+query.file;
	}
	else if ( query.type == 'uploaded' ) {
		if ( query.statut == 'pub' )				file.path = pwd+'/public/data/uploads/'+query.module+'/'+query.id+'/'+query.file;
		else if ( query.statut == 'priv' )		file.path = pwd+'/data/uploads/'+query.module+'/'+query.id+'/'+query.file;
	}
	console.log(file);
	param.main.tpl.file = file;
	
	if ( fs.existsSync(file.path) ) 	displayFile();
	else								error.unfound();
	
	
	function displayFile () {
		var mimetype = mime.lookup(file.path);
		param.res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
		param.res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(file.path);
		filestream.pipe(param.res);
	}
}
