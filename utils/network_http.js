"use strict"
const TAG = "network_express.js";

const express = require("express");
const http = require("http");

var nwh = module.exports;

nwh.createHttp = function(options, next){
    const httpSvr = http.createServer((req, res) => {
        const statusCode = res.statusCode;
        if (statusCode !== 200){
            return res.end("fail");
        }
        const ip = res.socket.remoteAddress;
        const port = res.socket.remotePort;
        console.log(TAG, "ip=", ip, port, req.url);
        requestRouteHandler(req, (ret)=>{
            res.end(JSON.stringify(ret));
        });
    });
    
    httpSvr.listen(options, ()=>{
        g_logger.info(TAG, "http server listen: ", options);
	});
	httpSvr.on("error", onError);
}

nwh.createExpress = function(options){
    var app = express();
    var server = http.createServer(app);
    server.listen(options, ()=>{
        g_logger.info(TAG, "express server listen: ", options);
    });
    server.on('error', onError);
    return app;
}

function onError(error) {
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
