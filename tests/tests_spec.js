var frisby = require("frisby");

var root_url = "http://localhost:1337";

var user = {
	username: "test_" + Math.round(Math.random()*1000000) + "@user_" + Math.round(Math.random()*1000000) + ".com",
	password: "whatever" + Math.random()
};

frisby.create("Register new user")
	.post(root_url + "/register", user)
	.inspectJSON()
	.expectStatus(200)
	.expectHeader("Content-Type", "application/json; charset=utf-8")
	.afterJSON(function (data) {
		var encrypted_token = data.strv_extra.encrypted_token;
		console.log(" ----");
		console.log("Token for 'Access-Token' header is", encrypted_token);
		console.log(" ----");

		frisby.create("Get list of contacts")
			.get(root_url + "/contacts")
			.addHeader("Access-Token", encrypted_token)
			.expectJSON({ count: 0, records: null })
			.inspectJSON()
			.toss();

		frisby.create("Try to get list of contacts without access token")
			.get(root_url + "/contacts")
			.expectStatus(401)
			.toss();

		var contact = {
			name: "Ondra",
			mail: "acrocz@gmail.com"
		};

		frisby.create("Create a contact")
			.post(root_url + "/contacts", contact)
			.addHeader("Access-Token", encrypted_token)
			.expectStatus(200)
			.inspectJSON()
			.afterJSON(function (res) {
				var record_id = res.name;

				var update = {
					name: "Jan"
				};

				frisby.create("Update a contact")
					.patch(root_url + "/contacts/" + record_id, update)
					.addHeader("Access-Token", encrypted_token)
					.expectStatus(200)
					.inspectJSON()
					.toss();

				frisby.create("Get updated contact")
					.get(root_url + "/contacts/" + record_id, update)
					.addHeader("Access-Token", encrypted_token)
					.expectStatus(200)
					.expectJSON({ name: "Jan" })
					.inspectJSON()
					.toss();
			})
			.toss();

		frisby.create("Get list of contacts after adding one contact")
			.get(root_url + "/contacts")
			.addHeader("Access-Token", encrypted_token)
			.expectJSON({ count: 1 })
			.inspectJSON()
			.afterJSON(function (res) {
				var record_id = Object.keys(res.records).pop()
				
				frisby.create("Delete a contact")
					.delete(root_url + "/contacts/" + record_id)
					.addHeader("Access-Token", encrypted_token)
					.expectStatus(200)
					.inspectJSON()
					.toss();

				frisby.create("Get list of contacts after deleting one contact")
					.get(root_url + "/contacts")
					.addHeader("Access-Token", encrypted_token)
					.expectJSON({ count: 0 })
					.inspectJSON()
					.toss();
			})
			.toss();
	})
.toss();