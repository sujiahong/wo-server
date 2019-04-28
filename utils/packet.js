"use strict"
const TAG = "utils/packet.js";
const logger = g_serverData.logger;

var p = module.exports;
///{route: "", reqId: 33, data: {}}
//////包头长度是4
p.pack = function(jsonData){
    var str = JSON.stringify(jsonData);
    var pack = Buffer.alloc(4 + str.length);
    pack.writeUInt32BE(str.length);
    pack.write(str, 4);
    return pack;
}
///解包
var unpack = function(buf, start, end){
    var str = buf.toString('utf8', start, end);
    return JSON.parse(str);
}
/////包解析
p.packageAnalysis = function(self, socket, buffer){
    self.remainderData = Buffer.concat([self.remainderData, buffer]);
    var len = self.remainderData.length;
    logger.debug(TAG, "data data: bufflen:", buffer.length, "remainderLen :", len);
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
        var jsonData = unpack(self.remainderData, idx - bodylen, idx);
        self.emit("socketData", socket, jsonData);
        if (idx == len){
            self.remainderData = Buffer.alloc(0);
            break;
        }
    }
}