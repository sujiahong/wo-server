"use strict"
const TAG = "utils/network_ws.js";
const ws = require("ws");
const packet = require("./packet");
const event = require("events");
const errcode = require("../share/errcode");
const packageAnalysis = packet.packageAnalysis;

const logger = g_serverData.logger;

class WSServer extends event.EventEmitter{
    constructor(options){
        super();
        this.options = options;
        this.server = null;
        this.socketMap = {};
        this.HBInterval = 30;
        this.remainderData = Buffer.alloc(0);
    }
    createServer(){
        var self = this;
        var server = new ws.Server(self.options);
        server.on("connection", function(socket, req){
            const ip = req.connection.remoteAddress;
            const port = req.connection.remotePort;
            socket.id = ip + ":" + port + ":" + Math.floor(Math.random()*Date.now());
            self.socketMap[socket.id] = socket;
            socket.on("message", function(buffer){
                logger.info("socket message", socket.id);
                packageAnalysis(self, socket, buffer);
            });
            socket.on("close", function(code, reason){
                logger.warn("socket close", code, reason);
                self.closeClientConn(socket.id);
            });
            socket.on("error", function(err){
                self.closeClientConn(socket.id);
                throw err;
            });
        });
        server.on("error", function(error){
            throw error;
        });
        server.on("listening", function(){
            logger.debug("ws server listening", self.options);
        });
        self.server = server;
        ///////
        self.on("socketData", function(socket, data){
            logger.debug(TAG, "Server socketData", socket.id, data);
            if (data.route == "ping"){
                if (socket.closeTimeId){
                    clearTimeout(socket.closeTimeId);
                    socket.closeTimeId = null;
                }
                self.pong(socket, data.time);
            }else{
                self.emit(data.route, socket.id, data);
            }
        });
    }
    push(socketId, data){
        var socket = this.socketMap[socketId];
        if (socket){
            var pack = packet.pack(data);
            socket.send(pack);
        }else{
            logger.fatal(TAG, "WSServer socket is null, 不能发送数据！！！");
        }
    }
    pong(socket, time){
        var self = this;
        this.push(socket.id, {route: "pong", time: time});
        socket.closeTimeId = setTimeout(() => {
            self.closeClientConn(socket.id);
        }, this.HBInterval*1000);
    }
    getSocketById(id){
        if (id){
            return this.socketMap[id];
        }
        return null;
    }
    closeClientConn(socketId){
        var socket = this.socketMap[socketId];
        if (socket){
            if (socket.closeTimeId){
                clearTimeout(socket.closeTimeId);
                socket.closeTimeId = null;
            }
            socket.close();
            delete this.socketMap[socketId];
        }
    }
};
module.exports = WSServer;