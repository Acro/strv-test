var crypto = require("crypto");
var _ = require("lodash");

var authHelperFactory = function (logger, config) {
	// private methods
	var encryptToken = function (token, expire_time) {
		var encipher = crypto.createCipheriv("aes-128-ecb", config.auth.private_key, "");
		var output = "";

		try {
			output += encipher.update(token + "_" + expire_time.getTime(), "ascii", "hex");
			output += encipher.final("hex");
		} catch (ex) {
			return null;
		}

		return output;
	};

	var decryptToken = function (token) {
		var decipher = crypto.createDecipheriv("aes-128-ecb", config.auth.private_key, "");
		var output = "";

		try {
			output += decipher.update(token, "hex");
			output += decipher.final();
		} catch (ex) {
			return [];
		}

		var arr = output.split("_");

		var result = {
			token: arr[0],
			expire_time: arr[1]
		};

		return result;
	};

	// public methods
	var auth = {};

	auth.getHashedPass = function (password) {
		var hashed_pass = crypto.createHash("sha256").update(password).digest("hex");
		return hashed_pass;
	};

	auth.generateToken = function (userhandle) {
		var random = (Math.random() * (new Date().getTime())).toString(16) + userhandle;
		var random_shuffled = _.shuffle(random).join("");
		var token = crypto.createHash("sha1").update( random_shuffled + userhandle ).digest("hex");
		return token;
	};

	auth.getEncryptedToken = function (token, expire_time) {
		return encryptToken(token, expire_time);
	};

	// koa middleware
	auth.authenticate = function* (next) {
		var is_public = _.contains(config.koa.public_routes, this.originalUrl);

		// if this route is public, move onto other middlewares right away
		if (is_public) {
			return yield next;
		}
	
		// otherwise validate access-token
		if (this.header["access-token"] == undefined) {
			this.throw(401, "Access token missing.");
		}

		var result = decryptToken(this.header["access-token"]);
		var now = new Date;

		if (now.getTime() - result.expire_time > 0) {
			this.throw(401, "Access token expired");
		}

		this.token = result.token;

		return yield next;
	};

	return auth;
};

// @autoinject
module.exports.auth = authHelperFactory;