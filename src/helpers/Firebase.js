var request = require("co-request");

var firebaseHelperFactory = function (logger, config) {
	// expose public methods
	var firebase = {};

	firebase.get = function* (path) {
		var result = yield request(config.firebase.root + path + ".json");
		return JSON.parse(result.body);
	};

	firebase.del = function* (path) {
		var result = yield request.del(config.firebase.root + path + ".json");

		if (result.statusCode != 200) {
			var err = new Error("There was a problem during deletion.");
			throw err;
		}

		var response = {
			message: "Contact successfully deleted."
		};

		return response;
	};

	firebase.add = function* (path, name, mail) {
		var req_opts = {
			uri: config.firebase.root + path + ".json",
			method: "POST",
			json: {
				name: name,
				mail: mail
			}
		};

		var result = yield request.post(req_opts);

		if (result.statusCode != 200) {
			throw result.body;
		}

		var response = result.body;
		response.message = "Contact successfully added.";
		return response; 
	};

	firebase.update = function* (path, update) {
		var req_opts = {
			uri: config.firebase.root + path + ".json",
			json: update
		};

		var result = yield request.patch(req_opts);

		if (result.statusCode != 200) {
			throw result.body;
		}

		var response = result.body;
		response.message = "Contact successfully updated.";
		return response; 
	};

	return firebase;
};

// @autoinject
module.exports.firebase = firebaseHelperFactory;