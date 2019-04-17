"use strict"
const TAG = "homeserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("home-server");
const logger = g_serverData.logger;
const assert = require("assert");
const cps = require("child_process");
const homeManager = require("./models/home_manager");
const network = require("../../utils/network");
const config = require("../../share/config");
const networkHttp = require("../../utils/network_http");
const dbConn = require("../../utils/db_connection");
logger.info("连接 redis server， mysql server pid: ", process.pid);
//连接redis
dbConn.redisConnect();
//连接mysql
dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
const router = require("./router");

const serverInfo = JSON.parse(process.argv[2]);
g_serverData.homeManager = new homeManager();
g_serverData.homeManager.serverName = serverInfo.NAME;
g_serverData.homeManager.serverId = serverInfo.ID;

logger.info(TAG, "home server start ~~!!!!", serverInfo.ID, process.pid, process.cwd());

var cli = new network.Client({host: config.CENTER_IP, port: config.CENTER_SOCKET_PORT});
cli.connect();
cli.request({route: "register", serverData: serverInfo}, function(data){
    logger.info(TAG, "向center server 注册 success code: ", data.code);
    //连接gate
    connectGate();
});

var connectGate = function(){
    var homeManager = g_serverData.homeManager;
    var gateList = require("../../config/cluster_info.json").GATE_SERVER_LIST;
    for (var i = 0; i < gateList.length; ++i){
        var gateClient = new network.Client({host: gateList[i].IP, port: gateList[i].FOR_HOME_PORT});
        gateClient.connect();
        gateClient.request({route: "register", serverData: serverInfo}, function(data){
            logger.info(TAG, "向gate server 注册 success code: ", data.code);
        });
        gateClient.on("recommend", function(data){
            logger.info(TAG, "recommend: ", data);
            homeManager.recommendationAccountMap[data.recommendation] = data.account;
        });
    }
}

var listenGameClient = function(){
    var homeManager = g_serverData.homeManager;
    var svr = new network.Server({host: serverInfo.IP, port: serverInfo.FOR_LOGIC_PORT});
    svr.createServer(function(socketId){});
    svr.recv(function(socketId, data){
        if (data.route == "register"){
            data.serverData.socketId = socketId;
            homeManager.idGameInfoMap[data.serverData.ID] = data.serverData;
            svr.send(socketId, {route: "register", code: 0});
            logger.debug(TAG, data.serverData.NAME, "注册成功在home server!!!");
        }
    });
    homeManager.forGameServer = svr;
}

var listenHttpClient = function(){
    var options = {
        host: serverInfo.IP,
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