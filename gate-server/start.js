"use strict"
const TAG = "gateserver-start.js";
const errcode = require("../share/errcode");
const http = require("http");
const URL = require("url");
const queryString = require("querystring");
const constant = require("../share/constant");
const config = require("../share/config");
const httpReq = require("../utils/http_request");
const redis = require("redis");
const network = require("../utils/network");
const utils = require("../utils/utils");

var GAME_SERVER_LIST = [];

var start = function(){
    const httpSvr = http.createServer((req, res) => {
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
    
    httpSvr.listen(config.GATE_HTTP_PORT, ()=>{
        console.log(TAG, "http server listen start.");
    });
    //requestRouteHandler({url: "/validateUser?code=081roMln014eNj1Xdtnn0HNWln0roMlQ&MiniId=1"})
    var serverId = 0;
    GAME_SERVER_LIST = utils.clone(config.GAME_SERVER_LIST);
    console.log("---==== ", GAME_SERVER_LIST)
    for (var i = 0; i < GAME_SERVER_LIST.length; ++i){
        if (!list[i].ISUSED){
            serverId = list[i].ID;
            list[i].ISUSED = true;
            break;
        }
    }
    ////////启动server
    var svr = new network.Server({port: config.GATE_SOCKET_PORT});
    svr.createServer(function(socketId){});
    svr.recv(function(data){

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

var redisConnect = function(){
    var conn = redis.createClient(config.REDIS_PORT, config.REDIS_IP, {});
    conn.on("error", (err)=>{
        console.error(TAG, "redis connect error:", err);
    });
    global.g_redisConn = conn;
}

var mongoConnect = function(){

}

exports.start = start;