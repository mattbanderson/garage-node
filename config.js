var config = {};

config.GARAGE_DOORS = [
  {
    name: 'Garage Door',
    pin: 11
  },
  {
    name: 'Garage Door #2',
    pin: 16
  }
];

config.RELAY_ON = 0;
config.RELAY_OFF = 1;
config.DOOR_CLOSED = 0;
config.DOOR_OPEN = 1;
config.RELAY_TIMEOUT = 500;

module.exports = config;
