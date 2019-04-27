"use strict"
const TAG = "utils/network.js";
const net = require("net");
const packet = require("./packet");
const event = require("events");
const util = require("util");
const errcode = require("../share/errcode");
const logger = g_serverData.logger;

const packageAnalysis = packet.packageAnalysis;

var nw = module.exports;

var Client = function(options){
    this.options = options
    this.socket = null;
    this.HBInterval = 25;
    this.HBTime = 0;
    this.freqTimeId = null;
    this.closeTimeId = null;
    this.remainderData = Buffer.alloc(0);
    this.sendFailData = Buffer.alloc(0);
};

util.inherits(Client, event.EventEmitter);

Client.prototype.connect = function(next){
    var self = this;
    doConnect(self, next);
    self.on("socketData", (socket, data)=>{
        logger.info(TAG, "Client socketData", data, self.HBTime);
        if (data.route == "pong"){
            if (data.time == self.HBTime){
                 if (self.closeTimeId){
                     clearTimeout(self.closeTimeId);
                     self.closeTimeId = null;
                 }
            }
        }else{
             self.emit(data.route, data);
        }
    });
}

var doConnect = function(self, next){
    var socket = net.createConnection(self.options);
    self.socket = socket;
    socket.on("close", ()=>{
        self.close();
        logger.warn(TAG, "socket client close close 尝试重新连接!!!");
        next ? next({code: errcode.CLIENT_SOCKET_CLOSE}) : null;
        setTimeout(function(){
            doConnect(self, next);
        }, 1000);
    });
    socket.on("error", (err)=>{
        logger.error(TAG, "client client socket error :", err);
        next ? next({code: errcode.CLIENT_SOCKET_ERR}) : null;
        throw err;
    });
    socket.on("connect", ()=>{
        logger.debug(TAG, process.pid, "客户端连接建立成功ip-port: ", socket.localAddress, socket.localPort, socket.remotePort);
        next ? next({code: 0, socket: socket}): null;
        setTimeout(()=>{
            self.ping();
            self.freqTimeId = setInterval(()=>{
                self.ping();
            }, self.HBInterval*1000);
        }, 1000);
    });
    socket.on("drain", ()=>{
        logger.error(TAG, "socket client drain事件 触发 触发 触发！！！");
    });
    socket.on("data", (buffer)=>{
        packageAnalysis(self, socket, buffer);
    });
}

Client.prototype.send = function(data){
    if (this.socket){
        var pack = packet.pack(data);
        var rt = this.socket.write(pack);
        if (rt == false){
            logger.fatal(TAG, "client socket send函数失败！！！");
            Buffer.concat([this.sendFailData, pack]);
        }
    }else{
        logger.fatal(TAG, "client socket is null, 不能发送数据！！！");
    }
}

Client.prototype.ping = function(){
    var self = this;
    this.HBTime = Date.now();
    this.send({route: "ping", time: this.HBTime, pid: process.pid});
    this.closeTimeId = setTimeout(()=>{
        self.closeTimeId = null;
        self.close();
    }, this.HBInterval*1000/2);
}

Client.prototype.request = function(data, next){
    this.send(data);
    this.once(data.route, (ret)=>{
        next(ret);
    });
}

Client.prototype.close = function(){
    if (this.socket){
        this.socket.destroy();
        this.socket = null;
    }
    if (this.freqTimeId){
        clearInterval(this.freqTimeId);
        this.freqTimeId = null;
    }
    if (this.closeTimeId){
        clearTimeout(this.closeTimeId);
        this.closeTimeId = null;
    }
    this.remainderData = Buffer.alloc(0);
    this.sendFailData = Buffer.alloc(0);
}
nw.Client = Client;


///////////////////////////////////////////////////////////////////////
///////////----------------------------------------------//////////////
///////////////////////////////////////////////////////////////////////

var Server = function(options){
    this.options = options;
    this.server = null;
    this.socketMap = {};
    this.HBInterval = 30;
    this.remainderData = Buffer.alloc(0);
    this.sendFailData = Buffer.alloc(0);
}

util.inherits(Server, event.EventEmitter);

Server.prototype.createServer = function(next){
    var self = this;
    var server = net.createServer();
    this.server = server;
    server.on("error", (err)=>{
        throw err;
    });
    server.on("connection", function(socket){
        socket.id = socket.remoteAddress + ":" + socket.remotePort + ":" + Date.now();
        self.socketMap[socket.id] = socket;
        logger.debug(TAG, process.pid, "服务端连接建立成功ip-port: ", socket.remoteAddress, socket.remotePort);
        socket.on("close", function(){
            logger.warn(TAG, "server close close socketId: ", socket.id);
            self.closeClientConn(socket.id);
            next ? next({code: errcode.SERVER_SOCKET_CLOSE, socketId: socket.id}) : null;
        });
        socket.on("error", function(err){
            self.closeClientConn(socket.id);
            logger.error(TAG, "server server socket err err", socket.id, err);
            next ? next({code: errcode.SERVER_SOCKET_ERR}) : null;
        });
        socket.on("data", function(buffer){
            packageAnalysis(self, socket, buffer);
        });
        socket.on("drain", function(){
            logger.fatal(TAG, "socket server drain事件 触发 触发 触发！！！");
        });
        socket.on("timeout", function(){
            logger.warn(TAG, "socket server timeout事件 触发 触发 触发！！！");
            self.closeClientConn(socket.id);
        });
        next ? next({code: 0, socketId: socket.id}) : null;
    });
    server.listen(this.options, ()=>{
        logger.debug(TAG, "socket server listen start!!", this.options);
    });
}

Server.prototype.send = function(socketId, data){
    var socket = this.socketMap[socketId];
    if (socket){
        var pack = packet.pack(data);
        var rt = socket.write(pack);
        if (rt == false){
            logger.fatal(TAG, "server socket send函数失败！！！");
            Buffer.concat([this.sendFailData, pack]);
        }
    }else{
        logger.fatal(TAG, "server socket closed or null, 不能发送数据!!!");
    }
}

Server.prototype.recv = function(next){
    var self = this;
    this.on("socketData", function(socket, data){
        logger.info(TAG, "Server socketData: ", socket.id, data);
        if (data.route == "ping"){
            if (socket.closeTimeId){
                clearTimeout(socket.closeTimeId);
                socket.closeTimeId = null;
            }
            self.pong(socket, data.time);
        }else{
            self.emit(data.route, socket.id, data);
            next(socket.id, data);
        }
    });
}

Server.prototype.getSocketById = function(id){
    if (id){
        return this.socketMap[id];
    }
    return null;
}

Server.prototype.pong = function(socket, time){
    var self = this;
    this.send(socket.id, {route: "pong", time: time});
    socket.closeTimeId = setTimeout(() => {
        self.closeClientConn(socket.id);
    }, this.HBInterval*1000);
}

Server.prototype.closeClientConn = function(socketId){
    var socket = this.socketMap[socketId];
    if (socket){
        if (socket.closeTimeId){
            clearTimeout(socket.closeTimeId);
            socket.closeTimeId = null;
        }
        socket.destroy();
        delete this.socketMap[socketId];
    }
}

Server.prototype.close = function(){
    this.server.close();
}

nw.Server = Server;