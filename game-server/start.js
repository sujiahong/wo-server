"use strict"
const TAG = "gameserver-start.js";
const network = require("../utils/network");
const config = require("../share/config");
const networkHttp = require("../utils/network_http");

var start = function(){
    //连接gate
    var cli = new network.Client({port: config.GATE_SOCKET_PORT});
    cli.connect();
    cli.recv(function(data){////监听

    });
    cli.request({request: "register"}, function(data){
        global.g_serverName = data.serverData.NAME;
        global.g_serverId = data.serverData.ID;
        console.log(TAG, data.serverData);
        ///启动express监听
        var options = {
            port: data.serverData.PORT,
        };
        var app = networkHttp.createExpress(options);
        app.get("/login", function(req, res){
            console.log(TAG, "登录！！！");
            res.send("success");
        });
    });
}

process.on("uncaughtException", (err)=>{
    console.error("caught exception: ", err.stack);
});

module.exports.start = start;