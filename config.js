var config = {};

// GPIO pin configuration
// Note: Based on BCM numbering, not physical pin numbers
config.GARAGE_DOORS = [
  {
    name: 'Garage Door',
    writePin: 17,
    readPin: 22
  },
  {
    name: 'Garage Door #2',
    writePin: 23,
    readPin: 25
  }
];

config.RELAY_ON = 0;
config.RELAY_OFF = 1;
config.DOOR_CLOSED = 0;
config.DOOR_OPEN = 1;
config.RELAY_TIMEOUT = 500;

module.exports = config;
