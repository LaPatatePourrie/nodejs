exports.loadGlobals = function () {
	// Variables
	this.variables();

	// Librairies
	global.lib = this.lib();

	// Modules 
	var modules = [
		 'http'
		,'util'
		,'connect'
		,'async'
		,'fs.extra'
		,'path'
		,'mime'
		,'url'
		,'cookie'
		,'underscore'
	]
	for ( var m=0; m<modules.length; m++ ) {
		var key = modules[m]
		var key = key.replace('.extra', '')
		var key = key.replace('underscore', '_')

		global[key] = require(modules[m]);
	}


	// Prototypes
	this.prototypes();
}

exports.lib = function () {
	
	var lib = {
		func		: loadLibrary('Functions'),
		users		: loadLibrary('Users'),
		time		: loadLibrary('Time')
	}
	
	return lib;
}

exports.prototypes = function () {
	loadLibrary('Prototypes').load();
}

exports.variables = function () {
}


function loadLibrary(lib) {
	return require(pwd+'/application/library/'+lib+'.js');
}