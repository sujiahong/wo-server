"use strict"
const TAG = "homeserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("home-server");
const logger = g_serverData.logger;
const assert = require("assert");
const homeManager = require("./models/home_manager");
const network = require("../../utils/network");
const config = require("../../share/config");
const errcode = require("../../share/errcode");
const networkHttp = require("../../utils/network_http");
const dbConn = require("../../utils/db_connection");
logger.info("连接 redis server， mysql server pid: ", process.pid);
//连接redis
dbConn.redisConnect();
//连接mysql
dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
require("../../dao/cache/mini_program/initCache");
const router = require("./router");

const serverInfo = JSON.parse(process.argv[2]);
const clusterInfo = JSON.parse(process.argv[3]);
g_serverData.homeManager = new homeManager();
g_serverData.homeManager.serverName = serverInfo.NAME;
g_serverData.homeManager.serverId = serverInfo.ID;

logger.info(TAG, "home server start ~~!!!!", serverInfo.ID, process.pid, process.cwd());

var connectGate = function(){
    var homeManager = g_serverData.homeManager;
    var gateList = clusterInfo.GATE_SERVER_LIST;
    for (let i = 0; i < gateList.length; ++i){
        let gateClient = new network.Client({host: gateList[i].IP, port: gateList[i].FOR_HOME_PORT});
        gateClient.connect(function(ret){
            if (ret.code != errcode.OK){
                if (ret.code == errcode.CLIENT_SOCKET_CLOSE){
                    logger.warn(TAG, g_serverData.homeManager.serverName, " socket close !!! to gate ", gateList[i].NAME);
                }else if (ret.code == errcode.CLIENT_SOCKET_ERR){
                    logger.error(TAG, g_serverData.homeManager.serverName, " socket error!!! to gate ", gateList[i].NAME);
                }
            }else{
                gateClient.request("register", serverInfo, function(data){
                    logger.info(TAG, "向gate server 注册 success code: ", data.code);
                });
            }
        });
        homeManager.gateIdClientMap[gateList[i].ID] = gateClient;
        gateClient.on("recommend", function(data){
            logger.info(TAG, "recommend: ", data);
            homeManager.recommendationAccountMap[data.recommendation] = data.account;
        });
        gateClient.on("home-info", function(data){
            var forGameServer = g_serverData.homeManager.forGameServer;
            var map = g_serverData.homeManager.idGameInfoMap;
            data.homeId = g_serverData.homeManager.serverId;
            for (var k in map){
                forGameServer.send(map[k].socketId, {route: "game-info", data: data});
            }
        });
    }
}

connectGate();

var listenGameClient = function(){
    var homeManager = g_serverData.homeManager;
    var svr = new network.Server({host: serverInfo.IP, port: serverInfo.FOR_LOGIC_PORT});
    svr.createServer(function(ret){
        if (ret.code == errcode.SERVER_SOCKET_CLOSE){
            for (var k in homeManager.idGameInfoMap){
                if (ret.socketId == homeManager.idGameInfoMap[k].socketId){
                    logger.warn(TAG, homeManager.idGameInfoMap[k].NAME, "socket close", ret.uid);
                    delete homeManager.idGameInfoMap[k];
                    return;
                }
            }
        }
    });
    svr.on("register", function(serverData, next){
        homeManager.idGameInfoMap[serverData.ID] = serverData;
        next({code: 0});
        logger.debug(TAG, serverData.NAME, "注册成功在home server!!!");
    });
    svr.on("game-info", function(info){
        var gateClient = g_serverData.homeManager.gateIdClientMap[info.gateId];
        gateClient.send({route: "home-info", data: info});
    });
    router.onGameListener(svr);
    homeManager.forGameServer = svr;
}

var listenHttpClient = function(){
    var options = {
        port: serverInfo.FOR_CLIENT_PORT,
    };
    var app = networkHttp.createExpress(options);
    app.use("/", router);
    app.use(function(req, res){
        res.send({code: 6});
    });
}

////////启动server
listenGameClient();
///启动http监听
listenHttpClient();

process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});