global.pwd = __dirname;

// Globals
var loader = require('./library/Loader.js').loadGlobals();

// Application
var config = require('./config/config').values;
var app = require('./config/app').load(config)
var io = require('socket.io').listen(app);


var port = 5000;
app.listen(port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


// Routes
require('./config/router').load(app, io);


process.on('SIGINT', function () {
	app.close();
	console.log();
	console.log('Shutting down server..');
	process.exit(0);
});
