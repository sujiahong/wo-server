"use strict"
const TAG = "gateserver-start.js";
global.g_serverData = {};
g_serverData.logger = require("../utils/log_launch")("gate-server");
const logger = g_serverData.logger;
const errcode = require("../share/errcode");
const URL = require("url");
const queryString = require("querystring");
const config = require("../share/config");
const network = require("../utils/network");
const utils = require("../utils/utils");
const networkHttp = require("../utils/network_http");
const dbConn = require("../utils/db_connection");

logger.info("连接数据库");
dbConn.redisConnect();
const mainService = require("./service/main_service");

var start = function(){
    g_serverData.serverName = "gate-server-1";
    g_serverData.serverId = 1;

    logger.info("启动gate server for home！！！！！！");
    g_serverData.homeServerList = utils.clone(config.HOME_SERVER_LIST);
    console.log("---==== ", g_serverData.homeServerList)
    ////////启动server
    var svr = new network.Server({port: config.GATE_SOCKET_PORT});
    svr.createServer(function(socketId){});
    svr.recv(function(socketId, data){
        if (data.route == "register"){
            var serverData;
            for (var i = 0; i < g_serverData.homeServerList.length; ++i){
                if (!g_serverData.homeServerList[i].ISUSED){
                    serverData = g_serverData.homeServerList[i];
                    g_serverData.homeServerList[i].ISUSED = true;
                    break;
                }
            }
            svr.send(socketId, {route: "register", serverData: serverData});
            if (g_serverData.homeNameSocketIdMap){
                g_serverData.homeNameSocketIdMap[serverData.NAME] = socketId;
            }else{
                g_serverData.homeNameSocketIdMap = {[serverData.NAME] : socketId};
            }
        }
    });
    g_serverData.gateServer = svr;
    ///启动http server
    listenHttpClient();
}

var listenHttpClient = function(){
    var options = {
        port: config.GATE_HTTP_PORT,
    }
    networkHttp.createHttp(options, function(req, res){
        const statusCode = res.statusCode;
        if (statusCode !== 200){
            return res.end("fail");
        }
        const ip = res.socket.remoteAddress;
        const port = res.socket.remotePort;
        console.log(TAG, "ip-port-url: ", ip, port, req.url);
        requestRouteHandler(req, (ret)=>{
            res.end(JSON.stringify(ret));
        });
    });
    //requestRouteHandler({url: "/validateUser?code=081roMln014eNj1Xdtnn0HNWln0roMlQ&MiniId=1"})
}

var requestRouteHandler = function(req, next){
    var urlData = URL.parse(req.url);
    if (urlData.pathname == "/validateUser"){
        mainService.validateUser(queryString.parse(urlData.query), next);
    }else if (urlData.pathname == "/checkRecommendation"){
        mainService.checkRecommendation(queryString.parse(urlData.query), next);
    }
}

exports.start = start;