"use strict";
const TAG = "network_http.js";
const express = require("express");
const http = require("http");

const logger = g_serverData.logger;
var nwh = module.exports;

nwh.createHttp = function(options, next){
    const httpSvr = http.createServer(next);
    httpSvr.listen(options, ()=>{
        logger.info(TAG, "http server listen: ", options);
	});
	httpSvr.on("clientError", function(err, socket){
		logger.error(TAG, "http client error: ", err);
		socket.end(JSON.stringify({code: 0}));
	});
}

nwh.createExpress = function(options){
    var app = express();
    var server = http.createServer(app);
    server.listen(options, ()=>{
        logger.info(TAG, "express server listen: ", options);
    });
    server.on('error', onError);
    return app;
}

function onError(error) {
	logger.error(TAG, "http error: ", error);
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(TAG, bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(TAG, bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}
