"use strict";
const TAG = "utils/packet.js";
const Buffer = require("buffer").Buffer;

var p = module.exports;
//////包头长度是4
p.pack = function(jsonData){
    var str = JSON.stringify(jsonData);
    var pack = Buffer.alloc(4 + str.length);
    pack.writeUInt32BE(str.length);
    pack.write(str, 4);
    return pack;
}
///解包
p.unpack = function(buf, start, end){
    var str = buf.toString('utf8', start, end);
    return JSON.parse(str);
}