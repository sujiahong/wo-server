"use strict"
const TAG = "gateserver-start.js";
const errcode = require("../share/errcode");
const URL = require("url");
const queryString = require("querystring");
const constant = require("../share/constant");
const config = require("../share/config");
const httpReq = require("../utils/http_request");
const network = require("../utils/network");
const utils = require("../utils/utils");
const networkHttp = require("../utils/network_http");
global.g_logger = require("../utils/log_launch")("gate-server");

var HOME_SERVER_LIST = [];

var start = function(){
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
        console.log(TAG, "ip=", ip, port, req.url);
        requestRouteHandler(req, (ret)=>{
            res.end(JSON.stringify(ret));
        });
    });
    //requestRouteHandler({url: "/validateUser?code=081roMln014eNj1Xdtnn0HNWln0roMlQ&MiniId=1"})
    g_logger.info("启动gate server！！！！！！")
    HOME_SERVER_LIST = utils.clone(config.HOME_SERVER_LIST);
    console.log("---==== ", HOME_SERVER_LIST)
    var serverData;
    ////////启动server
    var svr = new network.Server({port: config.GATE_SOCKET_PORT});
    svr.createServer(function(socketId){});
    svr.recv(function(socketId, data){
        if (data.request == "register"){
            for (var i = 0; i < HOME_SERVER_LIST.length; ++i){
                if (!HOME_SERVER_LIST[i].ISUSED){
                    serverData = HOME_SERVER_LIST[i];
                    HOME_SERVER_LIST[i].ISUSED = true;
                    break;
                }
            }
            svr.send(socketId, {request: "register", serverData: serverData})
        }
    });
    
}

var requestRouteHandler = function(req, next){
    var urlData = URL.parse(req.url);
    if (urlData.pathname == "/validateUser"){
        validateUser(queryString.parse(urlData.query), (ret)=>{

        });
    }
}

var validateUser = function(vData, next){
    httpReq.loginWX(vData, next);
}

exports.start = start;