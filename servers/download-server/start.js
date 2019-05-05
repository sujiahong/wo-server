"use strict";
const TAG = "download-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("download-server");
const logger = g_serverData.logger;
var nhp = require("../../utils/network_http");
const network = require("../../utils/network");
const URL = require("url");
const config = require("../../share/config");
const errcode = require("../../share/errcode");
const path = require("path");
const express = require("express");
const fs = require("fs");

var serverInfo = JSON.parse(process.argv[2]);
g_serverData.serverId = serverInfo.ID;
g_serverData.serverName = serverInfo.NAME;
logger.info(TAG, "download start ~~!!!!", serverInfo.ID, process.pid, process.cwd());

var cli = new network.Client({host: config.CENTER_IP, port: config.CENTER_SOCKET_PORT});
cli.connect(function(ret){
    if (ret.code != errcode.OK){
        if (ret.code == errcode.CLIENT_SOCKET_CLOSE){
            logger.warn(TAG, g_serverData.serverName, " socket close!!! to center");
        }else if (ret.code == errcode.CLIENT_SOCKET_ERR){
            logger.error(TAG, g_serverData.serverName, " socket error!!! to center");
        }
    }else{
        cli.request("register", serverInfo, function(data){
            logger.info(TAG, "向center server 注册 success code: ", data.code);
        });
    }
});

///////热更新下载
var app = nhp.createExpress({host: serverInfo.IP, port: serverInfo.FOR_CLIENT_PORT});
app.use(express.static(path.join(__dirname+"/assets", "hotupdate")));
///////游戏包下载
var appc = nhp.createExpress({host: serverInfo.IP, port: serverInfo.FOR_CLIENT_PORT+1});
appc.use(express.static(path.join(__dirname+"/assets", "game-package")));
///////config
nhp.createHttp({host: serverInfo.IP, port: serverInfo.FOR_CLIENT_PORT+2}, function(msg, res){
    var pathname = URL.parse(msg.url).pathname;
    pathname = __dirname + "/assets/config" + pathname;
    logger.info(TAG, "请求pathname:", pathname, msg.headers);
    fs.readFile(pathname, function(err, data){
        if (err){
            res.writeHead(404, {"Content-Type": "text/plain"});
            return res.end(err.code);
        }
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write(data, "binary");
        res.end();
    });
});


process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});