var raspi = require('raspi-io'),
    five = require('johnny-five'),
    board = new five.Board({
      io: new raspi()
    });

board.on('ready', function() {

  // Create an Led on pin 7 (GPIO4) and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  //(new five.Led(7)).strobe();
  (new five.Led(11)).strobe(); // PIN GPIO17

  // Create a new `sensor` hardware instance.
  var sensor = new five.Sensor("13");

  sensor.scale([ 0, 10 ]).on("data", function() {
    console.log( this.value );
  });
  
});