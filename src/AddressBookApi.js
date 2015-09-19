var koa = require("koa");
var koalogger = require("koa-logger");
var compress = require("koa-compress");
var route = require("koa-route");
var koabody = require("koa-body");

var app = module.exports = koa();

var apiFactory = function (logger, contact_route, login_route, config, auth) {
	var setupMiddlewares = function* () {
		app.use(auth.authenticate);
		app.use(koalogger());
		app.use(koabody());
	};

	var setupRoutes = function* () {
		app.use(route.get("/contacts", contact_route.getContacts));
		app.use(route.get("/contacts/:id", contact_route.getContact));
		app.use(route.post("/contacts", contact_route.add));
		app.use(route.patch("/contacts/:id", contact_route.update));
		app.use(route.delete("/contacts/:id", contact_route.remove));

		app.use(route.post("/login", login_route.login));
		app.use(route.post("/register", login_route.register));
	};

	// expose public methods
	var api = {};

	api.start = function* () {
		yield setupMiddlewares;
		yield setupRoutes;

		app.use(compress());

		var port = process.env.PORT || config.koa.port;
		app.listen(port);
		logger("API listening @", port);
	};

	return api;
};

// @autoinject
module.exports.api = apiFactory;