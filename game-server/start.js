"use strict"
const TAG = "gameserver-start.js";
const network = require("../utils/network");

var start = function(){
    //连接gate
    var cli = new network.Client({port: 8091});
    cli.connect();
    cli.recv(function(data){

    });
    ///启动express监听
}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

module.exports.start = start;