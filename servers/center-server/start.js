"use strict";
const TAG = "center-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("center-server");
const logger = g_serverData.logger;
const config = require("../../share/config");
const errcode = require("../../share/errcode");
const network = require("../../utils/network");
const networkHttp = require("../../utils/network_http");
const URL = require("url");
const queryString = require("querystring");
const dbConn = require("../../utils/db_connection");
//连接redis
dbConn.redisConnect();
//连接mysql
dbConn.mysqlPoolConnect(config.DB_NAME_LIST[1]);
logger.info(TAG, "center server start ~~!!!!", process.pid, process.cwd());
const mainService = require("./main_service");

g_serverData.innerServerInfo = {};
g_serverData.idServerInfoMap = {};
var svr = new network.Server({host: config.CENTER_IP, port: config.CENTER_SOCKET_PORT});
svr.createServer(function(ret){
    if (ret.code == errcode.SERVER_SOCKET_CLOSE){
        for (var k in g_serverData.idServerInfoMap){
            if (ret.socketId == g_serverData.idServerInfoMap[k].socketId){
                logger.warn(TAG, g_serverData.idServerInfoMap[k].NAME, "socket close", ret.uid);
                delete g_serverData.idServerInfoMap[k];
                return;
            }
        }
    }
});
svr.on("register", function(serverData, next){
    g_serverData.idServerInfoMap[serverData.ID] = serverData;
    next({code: 0});
    logger.debug(TAG, serverData.NAME, "注册成功在center server!!!");
});
svr.on("gate-num", function(data, next){
    var count = 0;
    for (var k in g_serverData.idServerInfoMap){
        if (g_serverData.idServerInfoMap[k].type == "gate-server")
            ++count;
    }
    next({code: 0, num: count});
});

svr.on("inner-servers-info", function(info){
    var innerServerInfo = g_serverData.innerServerInfo;
    if (!innerServerInfo[info.gateId]){
        innerServerInfo[info.gateId] = {
            [info.homeId]:{
                [info.gameInfo.id]: info.gameInfo,
            },
        };
    }else{
        if (!innerServerInfo[info.gateId][info.homeId]){
            innerServerInfo[info.gateId][info.homeId] = {[info.gameInfo.id]: info.gameInfo,};
        }else{
            innerServerInfo[info.gateId][info.homeId][info.gameInfo.id] = info.gameInfo;
        }
    }
});
g_serverData.centerServer = svr;

////////////监听消息
var options = {
    host: config.CENTER_IP,
    port: config.CENTER_HTTP_PORT,
}
networkHttp.createHttp(options, function(msg, res){
    const statusCode = res.statusCode;
    if (statusCode !== 200){
        return res.end("fail");
    }
    requestRouteHandler(msg, (ret)=>{
        res.end(JSON.stringify(ret));
    });
});

var requestRouteHandler = function(req, next){
    var urlData = URL.parse(req.url);
    if (urlData.pathname == "/login"){
        logger.info(TAG, "管理员用户登录, urlData.query");
    }else if (urlData.pathname == "/lookServerInfo"){
        
    }else{
        next({code: errcode.ROUTE_ERR});
    }
}

//////初始化用户数据
g_serverData.idUserDataMap = {};
mainService.initUserData();

process.on("exit", function(){
    logger.warn(TAG, "exit 事件", process.pid);
});

// process.on("SIGINT", function(){
//     logger.warn(TAG, "sigint 事件", process.pid);
// });

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});