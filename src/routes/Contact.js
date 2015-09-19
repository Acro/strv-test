var _ = require("lodash");

var contactRouteFactory = function (logger, firebase, user, response) {
	// expose public methods
	var route = {};

	route.getContacts = function* (next) {
		if (this.method != "GET") return yield next;

		this.user = yield user.getUser(this.token);

		this.type = "application/json";
		var data = yield firebase.get("/contacts/" + this.user.id);
		this.body = response.simple(data);
	};

	route.getContact = function* (id, next) {
		if (this.method != "GET") return yield next;

		this.user = yield user.getUser(this.token);

		this.body = yield firebase.get("/contacts/" + this.user.id + "/" + id);
	};

	route.remove = function* (id, next) {
		if (this.method != "DELETE") return yield next;

		this.user = yield user.getUser(this.token);

		try {
			this.body = yield firebase.del("/contacts/" + this.user.id + "/" + id);
		} catch (e) {
			logger(e);
			this.throw(401, "Deletion not successful.");
		}
	};

	route.add = function* (next) {
		if (this.method != "POST") return yield next;

		this.user = yield user.getUser(this.token);

		var name = this.request.body.name;
		var mail = this.request.body.mail;

		try {
			this.body = yield firebase.add("/contacts/" + this.user.id, name, mail);
		} catch (e) {
			logger(e);
			this.throw(403, "Adding was not successful.");
		}
	};

	route.update = function* (id, next) {
		if (this.method != "PATCH") return yield next;

		this.user = yield user.getUser(this.token);

		var update = this.request.body;

		try {
			this.body = yield firebase.update("/contacts/" + this.user.id + "/" + id, update);
		} catch (e) {
			logger(e);
			this.throw(403, "Updating was not successful.");
		}

	};

	return route;
};

// @autoinject
module.exports.contact_route = contactRouteFactory;