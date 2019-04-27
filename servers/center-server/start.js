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

g_serverData.idServerInfoMap = {};
var svr = new network.Server({host: config.CENTER_IP, port: config.CENTER_SOCKET_PORT});
svr.createServer(function(ret){
    if (ret.code == errcode.SERVER_SOCKET_CLOSE){
        for (var k in g_serverData.idServerInfoMap){
            if (ret.socketId == g_serverData.idServerInfoMap[k].socketId){
                logger.warn(TAG, g_serverData.idServerInfoMap[k].NAME, "socket close");
                delete g_serverData.idServerInfoMap[k];
                return;
            }
        }
    }
});
svr.recv(function(socketId, data){
    if (data.route == "register"){
        data.serverData.socketId = socketId;
        g_serverData.idServerInfoMap[data.serverData.ID] = data.serverData;
        svr.send(socketId, {route: "register", code: 0});
        logger.debug(TAG, data.serverData.NAME, "注册成功在center server!!!");
    }
});
g_serverData.centerServer = svr;

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