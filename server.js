global.pwd = __dirname;

// Globals
var loader = require('./application/library/Loader.js').loadGlobals();

// Application
var config = require('./application/config/config').values;
var app = require('./application/config/app').load(config)
var io = require('socket.io').listen(app);


var port = 1337;
app.listen(port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


// Routes
require('./application/config/router').load(app, io);


process.on('SIGINT', function () {
	app.close();
	console.log();
	console.log('Shutting down server..');
	process.exit(0);
});
