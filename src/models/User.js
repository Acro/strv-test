var userModelFactory = function (logger, mysql, auth) {
	// expose public methods
	var user = {};

	user.create = function* (username, password) {
		var insertion = {
			username: username,
			password: auth.getHashedPass(password),
			created: new Date
		};

		var query = "INSERT INTO users SET ?";

		return yield mysql.query(query, insertion);
	};

	user.login = function* (username, password) {
		var hashed_pass = auth.getHashedPass(password);

		var query = "SELECT * FROM users WHERE username = ? AND password = ?";

		var escaped_values = [
			username,
			hashed_pass
		];

		var user_arr = yield mysql.query(query, escaped_values);
		return user_arr.pop();
	};

	user.saveToken = function* (id, token, expire_time) {
		var insertion = {
			user: id,
			token: token,
			expire_time: expire_time,
			created: new Date
		};

		var query = "INSERT INTO tokens SET ?";

		return yield mysql.query(query, insertion);
	};

	user.getUser = function* (token) {
		var query = "SELECT * FROM users WHERE id = (SELECT user FROM tokens WHERE token = ?)";

		var escaped_values = [
			token
		];

		var user_arr = yield mysql.query(query, escaped_values);
		return user_arr.pop();
	};

	return user;
};

// @autoinject
module.exports.user = userModelFactory;