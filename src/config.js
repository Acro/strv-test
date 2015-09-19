var config = {
	auth: {
		access_token_ttl: 86400 * 30,
		private_key: "uWmEXUD12JFJvqiy"
	},
	koa: {
		port: 1337,
		public_routes: [ 
			"/login",
			"/register"
		]
	},
	firebase: {
		root: "https://strv-ondra.firebaseio.com"
	},
	mysql: {
		url: "mysql://b784746f0cc388:0de67474@us-cdbr-iron-east-02.cleardb.net/heroku_0a411f871ad1451?reconnect=true"
	}
};

// @autoexport
module.exports.config = config;