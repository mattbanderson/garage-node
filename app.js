'use strict';

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

function delayPinClose(pin, callback) {
	setTimeout(function() {
		gpio.close(pin);
	}, config.RELAY_TIMEOUT);
	callback(null, "done");
}

function gpioWriteTasks(pin) {
	return [
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
			function(callback) {
				// Turn the relay off after delay to simulate button press
				delayPinClose(pin, callback);
			}
	];
}

function gpioReadTasks(pin) {
	return [
		function(callback) {
			gpio.open(pin, "input", callback);
		},
		function(callback) {
			gpio.read(pin, callback);
		},
		function(callback) {
			gpio.close(pin);
			callback();
		}
	];
}

function simulateButtonPress(tasks, res) {
	// Append response to gpio tasks
	async.series(tasks.concat(
		function(err, results) {
				// Return json
				res.json("ok");
		}));
}

app.get("/api/ping", function(req, res) {
	res.json("pong");
});

app.get("/api/garage/door/1", function(req, res) {
	let pin = 15;
	async.series(gpioReadTasks(pin),
		function(err, result) {
			if (err) {
				res.json(err);
			} else {
				res.json(result[1]);
			}
		}
	);
});

app.post("/api/garage/door/1", function(req, res) {
	simulateButtonPress(gpioWriteTasks(config.GARAGE_DOORS[0].pin), res);
});

app.post("/api/garage/door/2", function(req, res) {
	simulateButtonPress(gpioWriteTasks(config.GARAGE_DOORS[1].pin), res);
});

app.post("/api/garage/all", function(req, res) {
		let tasks = [];
		for (var i = 0; i < config.GARAGE_DOORS.length; i++) {
			tasks.concat(gpioWriteTasks(config.GARAGE_DOORS[i].pin));
		}
		simulateButtonPress(tasks, res);
});

app.listen(app.get('port'));
