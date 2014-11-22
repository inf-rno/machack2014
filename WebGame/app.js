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
});

var count =0;
setInterval(function(){
	count++;
   io.emit('count', {'value':count});
   console.log(count);
}, 1000);

board.on('ready', function(){
    var led = new five.Led(11);
	led.strobe();
});

http.listen(process.env.PORT || 80);
