exports.load = function (app, io) {
	var mainCtrl = require('../application/controllers/main.ctrl');
	
	var param = {
		'app'		: app,
		'method'	: 'load'
	}
	
	
	// Back-office
	app.get('/admin/:pack', function(req, res) {
		loadCtrl(req, res, {office:'back'});
	});
	
	// Front-office
	app.get('/', function(req, res) {
		loadCtrl(req, res, {pack:'lamd', office:'back'});
	});
	app.get('/:pack', function(req, res) {
		loadCtrl(req, res, {});
	});
	app.post('/:pack', function(req, res) {
		loadCtrl(req, res, {method:'post'});
	});
	app.get('/:pack/:param', function(req, res) {
		loadCtrl(req, res, {url: [req.params.param]});
	});
	app.post('/:pack/:param', function(req, res) {
		loadCtrl(req, res, {method:'post', url: [req.params.param]});
	});
	
	
	loadCtrl = function (req, res, data) {
		if ( !data ) data = {};
		
		param = getDefaultParam();
		
		param.pack = req.params.pack;
		for ( i in data ) {
			param[i] = data[i]
		}
		param.res = res;
		param.req = req;
		if ( data.office ) param.office = data.office;
		
		mainCtrl.load(param);
	}
	
	getDefaultParam = function () {
		return {
			'app'		: app,
			'method'	: 'load',
			'office'	: 'front',
			'url'		: {}
		}
	}
		
	// Sockets
	var paramSocket = {
		'io'		: io,
		'app'		: app
	}
	mainCtrl.sockets(paramSocket);
}
