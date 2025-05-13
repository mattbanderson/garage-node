'use strict';

const express = require('express');
const path = require('path');
const config = require('./config');
const async = require('async');
const gpio = require('rpi-gpio');
const app = express();

app.set('port', process.env.PORT || 3000);
app.use('/', express.static(__dirname + '/public'));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

function delayPinWrite(pin, value, callback) {
	setTimeout(() => {
		gpio.write(pin, value, callback);
	}, config.RELAY_TIMEOUT);
}

function gpioWriteTasks(pin) {
	return [
		function(callback) {
			console.log("setting up pin for output");
			gpio.setup(pin, gpio.DIR_OUT, callback);
		},
		function(callback) {
			console.log("turning relay on");
			gpio.write(pin, config.RELAY_ON, callback);
		},
		function(callback) {
			console.log("turning relay off");
			delayPinWrite(pin, config.RELAY_OFF, callback);
		}
	];
}

function gpioReadTasks(pin) {
	return [
		function(callback) {
			gpio.setup(pin, gpio.DIR_IN, callback);
		},
		function(callback) {
			gpio.read(pin, (err, value) => {
				if (err) return callback(err);
				callback(null, value);
			});
		}
	];
}

function simulateButtonPress(tasks, res) {
	async.series(tasks.concat(function(err) {
		if (err) {
			console.error("GPIO task error:", err);
			res.status(500).json({ error: err.message });
		} else {
			res.json("ok");
		}
	}));
}

app.get("/api/ping", (req, res) => {
	res.json("pong");
});

app.get("/api/garage/door/1", (req, res) => {
	console.log('requesting garage door status');
	async.series(gpioReadTasks(config.GARAGE_DOORS[0].readPin), function(err, result) {
		if (err) {
			console.error("Error reading gpio pins", err);
			res.json(err);
		} else {
			res.json(result[1] ? 1 : 0); // library returns pin value as true or false, existing callers expect 1 or 0 
		}
	});
});

app.post("/api/garage/door/1", (req, res) => {
	console.log('garage door button pressed');
	try {
		simulateButtonPress(gpioWriteTasks(config.GARAGE_DOORS[0].writePin), res);
	} catch (err) {
		console.error("Error simulating button press: ", err);
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/garage/door/2", (req, res) => {
	simulateButtonPress(gpioWriteTasks(config.GARAGE_DOORS[1].writePin), res);
});

app.post("/api/garage/all", (req, res) => {
	let tasks = [];
	for (let i = 0; i < config.GARAGE_DOORS.length; i++) {
		tasks = tasks.concat(gpioWriteTasks(config.GARAGE_DOORS[i].writePin));
	}
	simulateButtonPress(tasks, res);
});

app.listen(app.get('port'), () => {
	console.log(`Server running on port ${app.get('port')}`);
});
