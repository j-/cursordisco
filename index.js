var program = require('commander');

process.on('uncaughtException', function (err) {
	console.error('%s: %s', err.name, err.message);
	process.exit(1);
});

program
	.version(require(__dirname + '/package.json').version)
	.option('-p, --port [number]', 'run HTTP server on a specific port [80]', 80)
	.parse(process.argv);

var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server, { log: false });

app.use(express.static(__dirname + '/static'));
server.listen(program.port);

// socket.io hijacks process.on('uncaughtException') and { log: false } disables it
server.on('error', function (err) {
	console.error('%s: %s', err.name, err.message);
	process.exit(1);
});

var id = 0;

io.sockets.on('connection', function (socket) {
	var userid = id++;
	
	socket.on('move', function (x, y) {
		socket.broadcast.emit('move', userid, x, y);
	});
	
	socket.on('disconnect', function () {
		socket.broadcast.emit('disconnect', userid);
	});
});

server.on('listening', function () {
	var address = server.address();
	console.log('server listening on %s:%s', address.address, address.port);
});