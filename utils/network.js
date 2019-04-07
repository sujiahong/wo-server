"use strict"
const TAG = "utils/network.js";
const net = require("net");
const packet = require("../utils/packet");
const event = require("events");
const util = require("util");

var nw = module.exports;

var Client = function(options){
    this.options = options
    this.socket = null;
    this.HBInterval = 20;
    this.HBTime = 0;
    this.freqTimeId = null;
    this.closeTimeId = null;
    this.remainderData = Buffer.alloc(0);
    this.sendFailData = Buffer.alloc(0);
};

util.inherits(Client, event.EventEmitter);

Client.prototype.connect = function(next){
    var self = this;
    var socket = net.createConnection(this.options);
    this.socket = socket;
    socket.on("close", ()=>{
        console.warn(TAG, "client close close ");
    });
    socket.on("error", (err)=>{
        console.error(TAG, "client client socket error :", err);
    });
    socket.on("connect", ()=>{
        console.log(TAG, process.pid, "客户端连接建立成功ip-port: ", socket.localAddress, socket.localPort, socket.remotePort);
        next ? next(socket): null;
        setTimeout(()=>{
            self.ping();
            self.freqTimeId = setInterval(()=>{
                self.ping();
            }, self.HBInterval*1000);
        }, 1000);
    });
    socket.on("drain", ()=>{
        console.log(TAG, 'drain event fired.');
    });
    socket.on("data", (buffer)=>{
        bufferAnalysis(self, socket, buffer);
    });
    self.on("socketData", (socket, data)=>{
        console.log(TAG, "Client socketData", data, self.HBTime);
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

Client.prototype.send = function(data){
    var pack = packet.pack(data);
    var rt = this.socket.write(pack);
    if (rt == false){
        Buffer.concat([this.sendFailData, pack]);
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
    this.on(data.route, (ret)=>{
        next(ret);
    });
}

Client.prototype.close = function(){
    this.socket.destroy();
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

var bufferAnalysis = function(self, socket, buffer){
    self.remainderData = Buffer.concat([self.remainderData, buffer]);
    var len = self.remainderData.length;
    console.log(TAG, "data data: bufflen:", buffer.length, "remainderLen :", len);
    var bodylen = 0;
    var packlen = 0;
    var idx = 0;
    while (true){
        if (len - idx < 4){
            self.remainderData = self.remainderData.slice(idx, len);
            break;
        }
        bodylen = self.remainderData.readUInt32BE(idx);
        packlen = bodylen + 4;
        if (idx + packlen > len){
            self.remainderData = self.remainderData.slice(idx, len);
            break;
        }
        idx += packlen;
        var jsonData = packet.unpack(self.remainderData, idx - bodylen, idx);
        self.emit("socketData", socket, jsonData);
        if (idx == len){
            self.remainderData = Buffer.alloc(0);
            break;
        }
    }
}

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
    server.on("close", function(){
        console.warn(TAG, "server close, close close!!!");
    });
    server.on("connection", function(socket){
        socket.id = socket.remoteAddress.substr(7) + ":" + socket.remotePort + ":" + Date.now();
        self.socketMap[socket.id] = socket;
        console.log(TAG, process.pid, "服务端连接建立成功ip-port: ", socket.remoteAddress.substr(7), socket.remotePort);
        socket.on("close", function(){
            console.warn(TAG, "server close close socketId: ", socket.id);
        });
        socket.on("error", function(err){
            console.error(TAG, "server server socket err err", socket.id, err);
        });
        socket.on("data", function(buffer){
            console.log(TAG, "server data", socket.id);
            bufferAnalysis(self, socket, buffer);
        });
        socket.on("timeout", function(){
            console.log(TAG, "timeout timeout");
        });
        next ? next(socket.id) : null;
    });
    server.listen(this.options, ()=>{
        console.log(TAG, "socket server listen start!!");
    });
}

Server.prototype.send = function(socketId, data){
    var pack = packet.pack(data);
    var rt = this.socketMap[socketId].write(pack);
    if (rt == false){
        Buffer.concat([this.sendFailData, pack]);
    }
}

Server.prototype.recv = function(next){
    var self = this;
    this.on("socketData", function(socket, data){
        console.log(TAG, "Server socketData", socket.id, data);
        if (data.route == "ping"){
            if (socket.closeTimeId){
                clearTimeout(socket.closeTimeId);
                socket.closeTimeId = null;
            }
            self.pong(socket, data.time);
        }else{
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
    if (socket.closeTimeId){
        clearTimeout(socket.closeTimeId);
        socket.closeTimeId = null;
    }
    socket.destroy();
    delete this.socketMap[socketId];
}

Server.prototype.close = function(){
    this.server.close();
}

nw.Server = Server;