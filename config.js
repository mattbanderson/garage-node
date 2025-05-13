var config = {};

config.GARAGE_DOORS = [
  {
    name: 'Garage Door',
    writePin: 11,
    readPin: 15
  },
  {
    name: 'Garage Door #2',
    writePin: 16,
    readPin: 22
  }
];

config.RELAY_ON = 0;
config.RELAY_OFF = 1;
config.DOOR_CLOSED = 0;
config.DOOR_OPEN = 1;
config.RELAY_TIMEOUT = 500;

module.exports = config;
