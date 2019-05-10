"use strict"
const TAG = "router.js";
const mainService = require("./service/main_service");
const jinService = require("./service/jinhua_service");
const errcode = require("../../share/errcode");

const manager = g_serverData.manager;

exports.notifyFromHome = function(cli){
    cli.on("game-info", function(data){
        data.gameInfo = {id: manager.serverId};
        cli.send({route: "game-info", data: data});
    });
    cli.on("createRoom", function(roomInfo){
        manager.connCodeUserIdMap[roomInfo.connectionCode] = roomInfo.userId;
        mainService.createRoom(roomInfo);
    });
}

exports.addMonitor = function(svr){
    svr.on("go", function(data, next){
        next({code: 0});
    });
    for (var k in mainService){
        if (k != "createRoom"){
            svr.on(k, mainService[k]);
        }
    }
    for (var k in jinService){
        svr.on(k, jinService[k]);
    }
}