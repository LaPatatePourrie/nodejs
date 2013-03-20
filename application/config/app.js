exports.load = function (config) {
	var express = require('express');
	var app = module.exports = express.createServer();

	//middleware
	function local_env (req, res, next){
		res.local('real_time_server', config.server.production.real_time_server)
		next();
	}

	app.configure(function() {
		app.set('views', pwd+'/application/src/bundle/views');
		app.set('view engine', 'jade');
		app.set('view options', { layout : false });
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.sessionStore = new express.session.MemoryStore({ reapInterval: 60000 * 10 });
		app.use(express.session({
			"secret": "some private string",
			"store":  this.sessionStore                                            
		}));
				
		app.use(local_env);
		app.use(app.router);
		
		var oneYear = 31557600000;
		app.use('/public', express.static(pwd+'/public', { maxAge: oneYear }));
	});

	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	app.configure('production', function (){
	  app.use(express.errorHandler()); 
	});
	
	return app;
};
