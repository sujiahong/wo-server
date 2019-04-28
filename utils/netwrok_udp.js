"use strict";
const TAG = "network_udp.js";
const udp = require("dgram");
const logger = g_serverData.logger;

class UDPServer {
    constructor(options){
        this.options = options;
        this.socket = null;
    }

    createServer(next){
        var socket = udp.createSocket(this.options);
        socket.bind(this.options.port);
        this.socket = socket;
        socket.on("error", function(err){
            throw err;
        });
        socket.on("close", function(){

        });
        socket.on("message", function(msg, rinfo){

        });
        socket.on("listening", function(){

        });
    }

    send(){
        this.socket.send();
    }
}

module.exports = UDPServer;