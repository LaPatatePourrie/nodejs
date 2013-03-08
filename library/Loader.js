exports.loadGlobals = function () {
	// Variables
	this.variables();

	// Librairies
	global.lib = this.lib();

	// Modules 
	global.util = require ('util');
	global.async = require('async');
	global.fs = require('fs.extra');
	global.path = require('path');
	global.mime = require('mime');
	global.url = require('url');
	global._ = require('underscore');

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
	return require(pwd+'/library/'+lib+'.js');
}