var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var five = require("johnny-five");
//var board = new five.Board();

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
	},500);
}

var lastValue = -1;
setInterval(function(){
	io.emit('flow', {value:currentFlow});
	if (currentFlow != lastValue)
	{
		console.log(currentFlow);
		lastValue = currentFlow;
	}
},100);


/*board.on('ready', function(){
    var led = new five.Led(13);
	led.strobe();
});
*/
http.listen(process.env.PORT || 80);
