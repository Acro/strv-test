var _ = require("lodash");

var responseHelperFactory = function (logger) {
	// expose public methods
	var response = {};

	response.simple = function (data) {
		var res = {
			count: _.keys(data).length,
			records: data
		};

		return res;
	};

	return response;
};

// @autoinject
module.exports.response = responseHelperFactory;