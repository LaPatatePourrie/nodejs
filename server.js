global.pwd = __dirname;

// Globals
var loader = require('./application/library/Loader.js').loadGlobals();

// Application
var config = require('./application/config/config').values;
var app = require('./application/config/app').load(config)
var server = http.createServer(app);


// Socket IO
var io = require('socket.io').listen(server);

io.set('authorization', function (data, accept) {
	if (!data.headers.cookie) {
		return accept('Session cookie required.', false);
	} 

	data.cookie = cookie.parse(data.headers.cookie);
	data.cookie = connect.utils.parseSignedCookies(data.cookie, 'secret');
 	
	/* NOTE: save ourselves a copy of the sessionID. */
	data.sessionID = data.cookie['express.sid'];
	/* NOTE: get the associated session for this ID. If it doesn't exist,
	* then bail. */
	app.sessionStore.get(data.sessionID, function(err, session){
		if (err)  			return accept('Error in session store.', false);
		else if (!session)  return accept('Session not found.', false);

		// success! we're authenticated with a known session.
		data.session = session;
		return accept(null, true);
	});
});



// Listen
var port = 1337;
server.listen(port);

console.log("Express server listening on port %d", server.address().port);



// Routes
require('./application/config/router').load(app, io);


process.on('SIGINT', function () {
	server.close();
	console.log();
	console.log('Shutting down server..');
	process.exit(0);
});
