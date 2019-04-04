"use strict"
const TAG = "utils/network_ws.js";
const ws = require("ws");


var nws = module.exports;

nws.createServer = function(options){
    var server = new ws.Server(options);
    server.on("connection", function(socket, req){
        socket.on("message", function(socket, data){

        });
    });
    server.on("error", function(socket, error){
        throw error;
    });
    return server;
}

nws.connect = function(){
    
}