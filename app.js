'use strict';

const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./config');
const lockfile = require('proper-lockfile');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use('/', express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

/*
 * SINGLE INSTANCE LOCK
 */
async function acquireLock() {
    try {
        await lockfile.lock(__dirname);
        console.log('Garage-node lock acquired');
    } catch {
        console.error('Another instance is already running');
        process.exit(1);
    }
}

/*
 * GPIO VIA gpioinfo/gpioget/gpioset (libgpiod CLI)
 */

function writeGPIO(pin, value) {
    execSync(`gpioset gpiochip0 ${pin}=${value}`);
}

function readGPIO(pin) {
    const output = execSync(`gpioget gpiochip0 ${pin}`).toString().trim();
    return output === '1' ? 1 : 0;
}

/*
 * HELPERS
 */

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function simulateButtonPress(i) {
    const pin = config.GARAGE_DOORS[i].writePin;

    console.log(`Trigger relay GPIO ${pin}`);

    writeGPIO(pin, config.RELAY_ON);
    await sleep(config.RELAY_TIMEOUT);
    writeGPIO(pin, config.RELAY_OFF);
}

function getDoorState(i) {
    const pin = config.GARAGE_DOORS[i].readPin;
    return readGPIO(pin);
}

/*
 * ROUTES
 */

app.get('/api/ping', (req, res) => {
    res.json('pong');
});

app.get('/api/garage/door/1', (req, res) => {
    res.json(getDoorState(0));
});

app.post('/api/garage/door/1', async (req, res) => {
    await simulateButtonPress(0);
    res.json('ok');
});

app.post('/api/garage/door/2', async (req, res) => {
    await simulateButtonPress(1);
    res.json('ok');
});

app.post('/api/garage/all', async (req, res) => {
    for (let i = 0; i < config.GARAGE_DOORS.length; i++) {
        await simulateButtonPress(i);
    }
    res.json('ok');
});

/*
 * STARTUP
 */

async function start() {
    await acquireLock();

    app.listen(app.get('port'), () => {
        console.log(`Garage server running on port ${app.get('port')}`);
    });
}

start();