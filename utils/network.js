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
    this.HBInterval = 30;
    this.HBTime = 0;
    this.freqTimeId = null;
    this.closeTimeId = null;
    this.remainderData = Buffer.alloc(0);
    this.sendFailData = Buffer.alloc(0);
    this.reqId = 0;
    this.reqIdHandlerMap = {};
};

util.inherits(Client, event.EventEmitter);

Client.prototype.connect = function(next){
    var self = this;
    doConnect(self, next);
    self.on("socketData", (socket, msg)=>{
        logger.info(TAG, "Client socketData", msg, self.HBTime);
        if (msg.route == "pong"){
            if (msg.time == self.HBTime){
                 if (self.closeTimeId){
                     clearTimeout(self.closeTimeId);
                     self.closeTimeId = null;
                 }
            }
        }else{
            if (msg.reqId){
                var handlerFunc = self.reqIdHandlerMap[msg.reqId];
                if (handlerFunc){
                    handlerFunc(msg.data);
                }else{
                    logger.fatal(TAG, "reqId 处理函数 null, reqId; ", msg.reqId);
                }
            }else{
                self.emit(msg.route, msg.data);
            }
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
        }, 3000+Math.floor(2000*Math.random()));
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
        data.reqId = this.reqId;
        var pack = packet.pack(data);
        var rt = this.socket.write(pack);
        if (rt == false){
            logger.fatal(TAG, "client socket send函数失败！！！");
            Buffer.concat([this.sendFailData, pack]);
        }
        return rt;
    }else{
        logger.fatal(TAG, "client socket is null, 不能发送数据！！！");
        return false;
    }
}

Client.prototype.ping = function(){
    var self = this;
    this.HBTime = Date.now();
    this.send({route: "ping", time: this.HBTime});
    this.closeTimeId = setTimeout(()=>{
        self.closeTimeId = null;
        self.close();
    }, this.HBInterval*1000/2);
}

Client.prototype.request = function(route, msg, next){
    var self = this;
    ++self.reqId;
    if (self.reqIdHandlerMap[self.reqId]){
        ++self.reqId;
    }
    let reqId = self.reqId;
    self.reqIdHandlerMap[reqId] = function(data){
        next(data);
        delete self.reqIdHandlerMap[reqId];
    };
    self.send({route: route, data: msg});
    if (self.reqId > 100000000000){
        self.reqId = 1;
    }
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
    this.HBInterval = 40;
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
        socket.id = socket.remoteAddress + ":" + socket.remotePort + ":" + Math.floor(Math.random()*Date.now());
        self.socketMap[socket.id] = socket;
        logger.debug(TAG, process.pid, "服务端连接建立成功ip-port: ", socket.remoteAddress, socket.remotePort);
        socket.on("close", function(){
            logger.warn(TAG, "server close close socketId: ", socket.id, socket._uid);
            self.closeClientConn(socket.id);
            next ? next({code: errcode.SERVER_SOCKET_CLOSE, socketId: socket.id, uid: socket._uid}) : null;
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
        next ? next({code: 0, socket: socket}) : null;
    });
    server.listen(this.options, ()=>{
        logger.debug(TAG, "socket server listen start!!", this.options);
    });
    this.on("socketData", function(socket, msg){
        logger.info(TAG, "Server socketData: ", socket.id, msg);
        if (msg.route == "ping"){
            if (socket.closeTimeId){
                clearTimeout(socket.closeTimeId);
                socket.closeTimeId = null;
            }
            self.pong(socket, msg);
        }else{
            if (msg.route == "register"){
                msg.data.socketId = socket.id;
                socket._uid = msg.data.ID;
            }
            self.emit(msg.route, msg.data, function(res){
                msg.data = res;
                self.send(socket.id, msg);
            });
        }
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

Server.prototype.push = function(socketId, route, msg){
    this.send(socketId, {route: route, data: msg});
}

Server.prototype.getSocketById = function(id){
    if (id){
        return this.socketMap[id];
    }
    return null;
}

Server.prototype.pong = function(socket, data){
    var self = this;
    data.route = "pong";
    this.send(socket.id, data);
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