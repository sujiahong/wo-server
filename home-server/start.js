"use strict"
const TAG = "homeserver-start.js";
const assert = require("assert");
const cps = require("child_process");
const cq = require("../config/cluster_quantity.json");
const network = require("../utils/network");
const config = require("../share/config");
const networkHttp = require("../utils/network_http");
const dbConn = require("../utils/db_connection");
global.g_logger = require("../utils/log_launch")("home-server");

var start = function(){
    g_logger.info("连接 redis server， mysql server pid: ", process.pid);
    //连接redis
    dbConn.redisConnect();
    //连接mysql
    dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
    //连接gate
    connectGate();
}

var connectGate = function(){
    var cli = new network.Client({port: config.GATE_SOCKET_PORT});
    cli.connect();
    cli.request({request: "register"}, function(data){
        global.g_serverName = data.serverData.NAME;
        global.g_serverId = data.serverData.ID;
        g_logger.info("启动home server ！！！！ server pid: ", process.pid, data.serverData);
        ///启动express监听
        var options = {
            port: data.serverData.FOR_CLIENT_PORT,
        };
        var app = networkHttp.createExpress(options);
        app.get("/login", function(req, res){
            console.log(TAG, "登录！！！");
            res.send("success");
        });
        //启动game server
        listenGameServer();
        //fork
        forkProcess();
    });
}

var listenGameServer = function(){
    var svr = new network.Server({port: getLogicPortbyId(g_serverId)});
    svr.createServer(function(socketId){});
    svr.recv(function(socketId, data){
        if (data.request == "register"){
            g_logger.info("serverId:", data.serverId, "前来注册在serverId: ", g_serverId);
            svr.send(socketId, {request: "register", msg: "register success!", serverId: g_serverId});
        }
    });
}

var getLogicPortbyId = function(id){
    for (var i = 0; i < config.HOME_SERVER_LIST.length; ++i){
        if (id == config.HOME_SERVER_LIST[i].ID){
            return config.HOME_SERVER_LIST[i].FOR_LOGIC_PORT;
        }
    }
}

var forkProcess = function(){
    var num = cq.game_quantity;
    var gameList = config.GAEM_SERVER_LIST;
    for (var i = 0; i < num; ++i){
        if (g_serverId == Math.floor(gameList[i].ID/10))
            cps.fork("./game-server/start", [gameList[i].ID, gameList[i].NAME]);
    }
}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

module.exports.start = start;