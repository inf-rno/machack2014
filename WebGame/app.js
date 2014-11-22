var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var raspi = require('raspi-io');
var five = require("johnny-five");
var board = new five.Board({
      io: new raspi()
    });

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
	    console.log('a user disconnected');
	});
	
	socket.on('simulate', function(msg)
	{
		 flowMeterPulsed(msg.value);
	});
});

var currentFlow = 0;
function flowMeterPulsed(howManyPulses)
{
	var _pulses = howManyPulses || 1;
	currentFlow += _pulses;
	setTimeout(function(){
		currentFlow -= _pulses;
	},250);
}

var tickCount = 0;
var lastValue = -1;
setInterval(function(){
	io.emit('flow', {value:currentFlow});
        tickCount++;
	if (currentFlow != lastValue)
	{
            // Turn a LED on while the player is blowing
            if(statusLED) {
                  if(currentFlow>10) {
                        statusLED.on();
                  } else {
                        statusLED.off();
                  }
            }
            
            if(tickCount%10===0) {
                  console.log(currentFlow);
            }
		
		lastValue = currentFlow;
	}
},100);

var statusLED;
board.on('ready', function(){
   var led = new five.Led(11);
   statusLED = new five.Led(15);
   statusLED.off();
   led.strobe(1000);

   var previousValue = board.pins[13].value;
   board.digitalRead(13, function(value) {
      if(previousValue !== value) {
            // The user is blowing
            flowMeterPulsed(1);
            previousValue = value;
      }
  })

});

http.listen(process.env.PORT || 80);
