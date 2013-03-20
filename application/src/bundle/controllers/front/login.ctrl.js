this.statut = 5;

exports.load = function (param, callback) {
	var model = param.main.model;
	
	if ( param.method == 'load' ) {
		if ( param.url && param.url[0] == 'deconnexion' ) {
			param.req.session.user = false;
			param.res.redirect('/login');
		}
		else {
			callback(param);
		}
	}
	else if ( param.method == 'post' ) {
		userLogin = param.req.body.login;
		userPasswd = param.req.body.passwd;
	
		model.getUsers(function (users) {
			var user = users.match(userLogin, userPasswd);
			
			if ( user ) {
				param.req.session.user = user;
				param.req.session.user.logged = true;
				param.req.session.user.firstConnection = true;
				
				if ( param.req.session.redirect ) {
					param.res.redirect(param.req.session.redirect);
				}
				else {
					param.res.redirect('/');
				}
			}
			else {
				param.res.redirect('/login');
			}
		});
	}
}


exports.sockets = function (param) {
}
