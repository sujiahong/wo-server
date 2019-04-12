"use strict"
const TAG = "homeserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../utils/log_launch")("home-server");
const logger = g_serverData.logger;
const assert = require("assert");
const cps = require("child_process");
const cq = require("../config/cluster_quantity.json");
const homeManager = require("./models/home_manager");
const network = require("../utils/network");
const config = require("../share/config");
const networkHttp = require("../utils/network_http");
const dbConn = require("../utils/db_connection");
logger.info("连接 redis server， mysql server pid: ", process.pid);
//连接redis
dbConn.redisConnect();
//连接mysql
dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
const router = require("./router");

var start = function(){
    g_serverData.homeManager = new homeManager();
    //连接gate
    connectGate();
}

var connectGate = function(){
    var cli = new network.Client({port: config.GATE_SOCKET_PORT});
    cli.connect();
    cli.request({route: "register"}, function(data){
        g_serverData.serverName = data.serverData.NAME;
        g_serverData.serverId = data.serverData.ID;
        logger.info("启动home server ！！！！ server pid: ", process.pid, data.serverData);
        g_serverData.recommendationAccountMap = {};
        cli.on("recommend", function(data){
            logger.info(TAG, "recommend: ", data);
            g_serverData.recommendationAccountMap[data.recommendation] = data.account;
        });
        ///启动express监听
        var options = {
            port: data.serverData.FOR_CLIENT_PORT,
        };
        var app = networkHttp.createExpress(options);
        app.use("/", router);
        //启动game server
        listenGameServer();
        //fork
        forkProcess();
    });
}

var listenGameServer = function(){
    var svr = new network.Server({port: getLogicPortbyId(g_serverData.serverId)});
    svr.createServer(function(socketId){});
    svr.recv(function(socketId, data){
        if (data.route == "register"){
            logger.info("serverId:", data.serverId, "前来注册在serverId: ", g_serverData.serverId);
            svr.send(socketId, {route: "register", msg: "register success!", serverId: g_serverData.serverId});
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
        if (g_serverData.serverId == Math.floor(gameList[i].ID/10))
            cps.fork("./game-server/start", [gameList[i].ID, gameList[i].NAME]);
    }
}

process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

module.exports.start = start;