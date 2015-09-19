var co = require("co");
var mysql = require("promise-mysql"); 

var ZenInjector = require("zeninjector");
var container = new ZenInjector();

container.registerAndExport("logger", console.log);

var startApi = function* () {
	var api = yield container.resolve("api");
	yield api.start;
};

var prepare = function* () {
	var mysql_conn = yield mysql.createConnection("mysql://b784746f0cc388:0de67474@us-cdbr-iron-east-02.cleardb.net/heroku_0a411f871ad1451?reconnect=true");
	container.registerAndExport("mysql", mysql_conn);

	yield container.scan(__dirname + "/**/*.js");

	var jobs = [
		startApi
	];

	yield jobs;
};

var handleError = (err) => {
	console.log(err, err.stack);
};

co(prepare).catch(handleError);