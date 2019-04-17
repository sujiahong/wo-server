"use strict";
const TAG = "center-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("center-server");
const logger = g_serverData.logger;
const config = require("../../share/config");
const network = require("../../utils/network");

logger.info(TAG, "center server start ~~!!!!", process.pid, process.cwd());

g_serverData.idServerInfoMap = {};
var svr = new network.Server({host: config.CENTER_IP, port: config.CENTER_SOCKET_PORT});
svr.createServer(function(socketId){});
svr.recv(function(socketId, data){
    if (data.route == "register"){
        g_serverData.idServerInfoMap[data.serverData.ID] = data;
        data.serverData.socketId = socketId;
        svr.send(socketId, {route: "register", code: 0});
        logger.debug(TAG, data.serverData.NAME, "注册成功在center server!!!");
    }
});
g_serverData.centerServer = svr;

process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});