"use strict"
const TAG = "gameserver-start.js";
const network = require("../utils/network");
const config = require("../share/config");

var start = function(){
    //连接gate
    var cli = new network.Client({port: config.GATE_SOCKET_PORT});
    cli.connect();
    cli.recv(function(data){

    });


    ///启动express监听
    console.log(TAG, process.pid, "game server Id: ", serverId);
}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

module.exports.start = start;