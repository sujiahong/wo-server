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
    var homeManager = g_serverData.homeManager;
    var cli = new network.Client({host: config.GATE_IP,port: config.GATE_SOCKET_PORT});
    cli.connect();
    cli.request({route: "register"}, function(data){
        homeManager.serverName = data.serverData.NAME;
        homeManager.serverId = data.serverData.ID;
        logger.info("启动home server ！！！！ server pid: ", process.pid, data.serverData);
        cli.on("recommend", function(data){
            logger.info(TAG, "recommend: ", data);
            homeManager.recommendationAccountMap[data.recommendation] = data.account;
        });
        ///启动express监听
        var options = {
            host: data.serverData.IP,
            port: data.serverData.FOR_CLIENT_PORT,
        };
        var app = networkHttp.createExpress(options);
        app.use("/", router);
        app.use(function(req, res){
            res.send({code: 6});
        });
        //启动game server
        listenGameServer();
        //fork
        forkProcess();
    });
}

var listenGameServer = function(){
    var serverId = g_serverData.homeManager.serverId;
    var svr = new network.Server(getLogicAddrbyId(serverId));
    svr.createServer(function(socketId){});
    svr.recv(function(socketId, data){
        if (data.route == "register"){
            logger.info("serverId:", data.serverId, "前来注册在serverId: ", serverId);
            svr.send(socketId, {route: "register", msg: "register success!", serverId: serverId});
            g_serverData.homeManager.gameServerIdSocketIdMap[data.serverId] = socketId;
        }
    });
    g_serverData.homeManager.forGameServer = svr;
}

var getLogicAddrbyId = function(id){
    var addr = {};
    for (var i = 0; i < config.HOME_SERVER_LIST.length; ++i){
        if (id == config.HOME_SERVER_LIST[i].ID){
            addr.host = config.HOME_SERVER_LIST[i].IP;
            addr.port = config.HOME_SERVER_LIST[i].FOR_LOGIC_PORT;
            return addr;
        }
    }
    return addr;
}

var forkProcess = function(){
    var num = cq.game_quantity;
    var gameList = config.GAEM_SERVER_LIST;
    for (var i = 0; i < num; ++i){
        if (g_serverData.homeManager.serverId == Math.floor(gameList[i].ID/10))
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