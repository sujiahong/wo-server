"use strict";
const TAG = "net_client.js";
const packet = require("./packet");
const Buffer = require("buffer").Buffer;

var cls = {};

var bufferAnalysis = function(self, buffer){
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
        self.node.emit("socketData", jsonData);
        if (idx == len){
            self.remainderData = Buffer.alloc(0);
            break;
        }
    }
}

var doConnect = function(self, url, next){
    var socket = new WebSocket(url);
    socket.onopen = function(){
        self.socket = socket;
        console.log("1111111111  onopen ");
        next ? next() : null;
        setTimeout(()=>{
            self.ping();
            self.freqTimeId = setInterval(()=>{
                self.ping();
            }, self.HBInterval*1000);
        }, 1000);
    }
    socket.onmessage = function(event){
        console.log("2222222222 onmessage", event.data);
        bufferAnalysis(self, new Buffer(event.data));
    }
    socket.onclose = function(){
        console.log("3333333333  onclose 准备重新连接！！！ ");
        self.close();

    }
    socket.onerror = function(event){
        console.log("4444444444  onerror ", event);
        for (var k in event){
            console.log(k, event[k]);
        }
        throw event;
    }
}

cls.ctor = function(){
    this.socket = null;
    this.addr = arguments[0];
    this.HBInterval = 20;
    this.HBTime = 0;
    this.freqTimeId = null;
    this.closeTimeId = null;
    this.remainderData = Buffer.alloc(0);
    this.reconnectTimes = 3;
    this.node = new cc.Node();
}


cls.connect = function(next){
    var self = this;
    var url = "ws://" + this.addr.ip + ":" + this.addr.port;
    console.log(TAG, "准备连接服务器：", url, this.node);
    doConnect(self, url, next);
    self.node.on("socketData", (data)=>{
        console.log(TAG, "Client socketData", data, self.HBTime);
        if (data.route == "pong"){
            if (data.time == self.HBTime){
                 if (self.closeTimeId){
                     clearTimeout(self.closeTimeId);
                     self.closeTimeId = null;
                 }
            }
        }else{
             self.node.emit(data.route, data);
        }
    });
}

cls.send = function(data){
    var pack = packet.pack(data);
    this.socket.send(pack);
}

cls.ping = function(){
    var self = this;
    this.HBTime = Date.now();
    this.send({route: "ping", time: this.HBTime});
    this.closeTimeId = setTimeout(()=>{
        self.closeTimeId = null;
        self.close();
    }, this.HBInterval*1000/2);
}

cls.request = function(data, next){
    this.send(data);
    this.event.on(data.route, (ret)=>{
        next(ret);
    });
}

cls.close = function(){
    this.socket.close();
    if (this.freqTimeId){
        clearInterval(this.freqTimeId);
        this.freqTimeId = null;
    }
    if (this.closeTimeId){
        clearTimeout(this.closeTimeId);
        this.closeTimeId = null;
    }
    this.remainderData = Buffer.alloc(0);
}

var WSClient = cc.Class(cls);
module.exports = WSClient;
