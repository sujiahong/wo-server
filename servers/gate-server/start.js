"use strict"
const TAG = "gateserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../../utils/log_launch")("gate-server");
const logger = g_serverData.logger;
const errcode = require("../../share/errcode");
const URL = require("url");
const queryString = require("querystring");
const config = require("../../share/config");
const network = require("../../utils/network");
const networkHttp = require("../../utils/network_http");
const dbConn = require("../../utils/db_connection");

logger.info("连接数据库");
dbConn.redisConnect();
const mainService = require("./service/main_service");

const serverInfo = JSON.parse(process.argv[2]);
const clusterInfo = JSON.parse(process.argv[3]);
g_serverData.serverName = serverInfo.NAME;
g_serverData.serverId = serverInfo.ID;
g_serverData.accessCount = 0;
g_serverData.gateServerNum = 0;

logger.info(TAG, "gate server start ~~!!!!", serverInfo.ID, process.pid, process.cwd());

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
            setTimeout(function(){
                cli.request("gate-num", {}, function(data){
                    g_serverData.gateServerNum = data.num;
                });
            }, 3000);
        });
    }
});

cli.on("inner-servers-info", function(data){
    var forHomeServer = g_serverData.forHomeServer;
    var map = g_serverData.idHomeInfoMap;
    for(var k in map){
        forHomeServer.send(map[k].socketId, {route: "home-info", data: data});
    }
});


var listenHomeClient = function(){
    g_serverData.idHomeInfoMap = {};
    var svr = new network.Server({host: serverInfo.IP, port: serverInfo.FOR_HOME_PORT});
    svr.createServer(function(ret){
        if (ret.code == errcode.SERVER_SOCKET_CLOSE){
            for (var k in g_serverData.idHomeInfoMap){
                if (ret.socketId == g_serverData.idHomeInfoMap[k].socketId){
                    logger.warn(TAG, g_serverData.idHomeInfoMap[k].NAME, "socket close", ret.uid);
                    delete g_serverData.idHomeInfoMap[k];
                    return;
                }
            }
        }
    });
    svr.on("register", function(serverData, next){
        g_serverData.idHomeInfoMap[serverData.ID] = serverData;
        next({code: 0});
        logger.debug(TAG, serverData.NAME, "注册成功在gate server!!!");
    });
    svr.on("home-info", function(info){
        cli.send({route: "inner-servers-info", data: info});
    });
    g_serverData.forHomeServer = svr;
}

var listenHttpClient = function(){
    var options = {
        port: serverInfo.FOR_HTTP_PORT,
    }
    networkHttp.createHttp(options, function(req, res){
        const statusCode = res.statusCode;
        if (statusCode !== 200){
            return res.end("fail");
        }
        requestRouteHandler(req, (ret)=>{
            res.end(JSON.stringify(ret));
        });
    });
    //requestRouteHandler({url: "/validateUser?code=081roMln014eNj1Xdtnn0HNWln0roMlQ&MiniId=1"})
}

var requestRouteHandler = function(req, next){
    var urlData = URL.parse(req.url);
    if (urlData.pathname == "/validateUser"){
        ++g_serverData.accessCount;
        logger.info(TAG, "验证用户身份，获取推荐码", urlData.query);
        mainService.validateUser(queryString.parse(urlData.query), next);
    }else if (urlData.pathname == "/checkRecommendation"){
        mainService.checkRecommendation(queryString.parse(urlData.query), next);
    }else{
        next({code: errcode.ROUTE_ERR});
    }
}

////////启动server
listenHomeClient();
///启动http server
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