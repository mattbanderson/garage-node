var express = require('express'),
	path = require('path'),
	config = require('./config'),
	async = require('async'),
	gpio = require('pi-gpio'),
	app = express();

app.set('port', process.env.PORT || 3000);

app.use('/', express.static(__dirname + '/public'));

function delayPinWrite(pin, value, callback) {
	setTimeout(function() {
		gpio.write(pin, value, callback);
	}, config.RELAY_TIMEOUT);
}

function simulateButtonPress(pin) {
	async.series([
		function(callback) {
			// Open pin for output
			gpio.open(pin, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(pin, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(pin, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				gpio.close(pin);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
}

app.get("/api/ping", function(req, res) {
	res.json("pong");
});


app.post("/api/garage/door/1", function(req, res) {
	simulateButtonPress(config.GARAGE_DOORS[0].pin);
});

app.post("/api/garage/door/2", function(req, res) {
	async.series([
		function(callback) {
			// Open pin for output
			gpio.open(config.GARAGE_DOOR_2_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(config.GARAGE_DOOR_2_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.GARAGE_DOOR_2_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				gpio.close(config.GARAGE_DOOR_2_PIN);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
});

app.post("/api/garage/all", function(req, res) {
	async.series([
		function(callback) {
			// Open pin for output
			gpio.open(config.GARAGE_DOOR_2_PIN, "output", callback);
		},
		function(callback) {
			// Open pin for output
			gpio.open(config.GARAGE_DOOR_1_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(config.GARAGE_DOOR_2_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(config.GARAGE_DOOR_1_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.GARAGE_DOOR_2_PIN, config.RELAY_OFF, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.GARAGE_DOOR_1_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				gpio.close(config.GARAGE_DOOR_1_PIN);
				gpio.close(config.GARAGE_DOOR_2_PIN);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
});

app.listen(app.get('port'));
