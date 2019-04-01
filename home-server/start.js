"use strict"
const TAG = "homeserver-start.js";
const network = require("../utils/network");
const config = require("../share/config");
const networkHttp = require("../utils/network_http");
const dbConnect = require("../utils/db_connection");
global.g_logger = require("../utils/log_launch")("home-server");

var start = function(){
    //连接gate
    var cli = new network.Client({port: config.GATE_SOCKET_PORT});
    cli.connect();
    cli.recv(function(data){////监听

    });
    cli.request({request: "register"}, function(data){
        global.g_serverName = data.serverData.NAME;
        global.g_serverId = data.serverData.ID;
        g_logger.info("启动home server ！！！！ server pid: ", process.pid, data.serverData);
        ///启动express监听
        var options = {
            port: data.serverData.PORT,
        };
        var app = networkHttp.createExpress(options);
        app.get("/login", function(req, res){
            console.log(TAG, "登录！！！");
            res.send("success");
        });
    });

    g_logger.info("连接 redis server!!!! ");
    //连接redis
    dbConnect.redisConnect();
}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

module.exports.start = start;