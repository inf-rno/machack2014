var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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

http.listen(process.env.PORT || 80);
