var loginRouteFactory = function (logger, user, auth, config) {
	// expose public methods
	var route = {};

	route.login = function* (next) {
		if (this.method != "POST") return yield next;
		
		var username = this.request.body.username;
		var password = this.request.body.password;

		if (username == undefined || password == undefined) {
			this.throw(403, "Username or password missing.");
		}

		var logged_user = yield user.login(username, password);

		if (logged_user == undefined) {
			this.throw(403, "No matching records for this username and password.")
		}

		var token = auth.generateToken(username);

		var now = new Date;
		var expire_time = new Date(now.getTime() + config.auth.access_token_ttl * 1000);

		try {
			var result = yield user.saveToken(logged_user.id, token, expire_time);
		} catch (e) {
			this.throw(500, "Unexpected error. Please try again later.")
		}

		var response = {
			message: "Successfully logged in.",
			access_token: token,
			expire_time: expire_time,
			strv_extra: {
				notes: [
					"This would not be present in the real API.",
					"Use the token below as 'access-token' header",
					"The encryption of the token is supposed to be done by the client (smartphone app)"
				],
				encrypted_token: auth.getEncryptedToken(token, expire_time)
			}
		};

		this.body = response;
	};

	route.register = function* (next) {
		if (this.method != "POST") return yield next;
		
		var username = this.request.body.username;
		var password = this.request.body.password;

		if (username == undefined || password == undefined) {
			this.throw(403, "Username or password missing.");
		}

		try { 
			var created_user = yield user.create(username, password);
		} catch (e) {
			this.throw(403, "This username already exists.");
		}
		
		var token = auth.generateToken(username);

		var now = new Date;
		var expire_time = new Date(now.getTime() + config.auth.access_token_ttl * 1000);

		try {
			var result = yield user.saveToken(created_user.insertId, token, expire_time);
		} catch (e) {
			this.throw(500, "Unexpected error. Please try again later.")
		}
		
		var response = {
			message: "Successfully registered.",
			access_token: token,
			expire_time: expire_time,
			strv_extra: {
				notes: [
					"This would not be present in the real API.",
					"Use the token below as 'access-token' header",
					"The encryption of the token is supposed to be done by the client (smartphone app)"
				],
				encrypted_token: auth.getEncryptedToken(token, expire_time)
			}
		};

		this.body = response;
	};

	return route;
};

// @autoinject
module.exports.login_route = loginRouteFactory;