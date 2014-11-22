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
	
		console.log("simulating "+JSON.stringify(msg));
	    io.emit('flow', msg);
	});
});

var count =0;
setInterval(function(){
	count++;
   io.emit('count', {'value':count});
   console.log(count);
}, 1000);

/*board.on('ready', function(){
    var led = new five.Led(13);
	led.strobe();
});
*/
http.listen(process.env.PORT || 80);
